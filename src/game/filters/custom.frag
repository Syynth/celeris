#version 300 es
precision mediump float;

in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec3 highestColor;
uniform float similarThreshold;
uniform float lineWidth;

#define SLOPE
#define CLEANUP

const mat3 yuv_matrix = mat3(
        vec3(0.299, 0.587, 0.114),
        vec3(-0.169, -0.331, 0.5),
        vec3(0.5, -0.419, -0.081)
    );

vec3 yuv(vec3 col) {
    mat3 yuv = transpose(yuv_matrix);
    return yuv * col;
}

bool similar(vec4 col1, vec4 col2) {
    return (col1.a == 0. && col2.a == 0.) || distance(col1, col2) <= similarThreshold;
}

bool similar3(vec4 col1, vec4 col2, vec4 col3) {
    return similar(col1, col2) && similar(col2, col3);
}

bool similar4(vec4 col1, vec4 col2, vec4 col3, vec4 col4) {
    return similar(col1, col2) && similar(col2, col3) && similar(col3, col4);
}

bool similar5(vec4 col1, vec4 col2, vec4 col3, vec4 col4, vec4 col5) {
    return similar(col1, col2) && similar(col2, col3) && similar(col3, col4) && similar(col4, col5);
}

bool higher(vec4 thisCol, vec4 otherCol) {
    if (similar(thisCol, otherCol)) return false;
    if (thisCol.a == otherCol.a) {
        return distance(thisCol.rgb, highestColor) < distance(otherCol.rgb, highestColor);
    } else {
        return thisCol.a > otherCol.a;
    }
}

vec4 higherCol(vec4 thisCol, vec4 otherCol) {
    return higher(thisCol, otherCol) ? thisCol : otherCol;
}

float cd(vec4 col1, vec4 col2) {
    return distance(col1.rgba, col2.rgba);
}

float distToLine(vec2 testPt, vec2 pt1, vec2 pt2, vec2 dir) {
    vec2 lineDir = pt2 - pt1;
    vec2 perpDir = vec2(lineDir.y, -lineDir.x);
    vec2 dirToPt1 = pt1 - testPt;
    return (dot(perpDir, dir) > 0.0 ? 1.0 : -1.0) * (dot(normalize(perpDir), dirToPt1));
}

vec4 sliceDist(
    vec2 point, vec2 mainDir, vec2 pointDir,
    vec4 ub, vec4 u, vec4 uf, vec4 uff,
    vec4 b, vec4 c, vec4 f, vec4 ff,
    vec4 db, vec4 d, vec4 df, vec4 dff,
    vec4 ddb, vec4 dd, vec4 ddf
) {
    #ifdef SLOPE
    float minWidth = 0.45;
    float maxWidth = 1.142;
    #else
    float minWidth = 0.0;
    float maxWidth = 1.4;
    #endif
    float _lineWidth = max(minWidth, min(maxWidth, lineWidth));
    point = mainDir * (point - 0.5) + 0.5; //flip point

    float distAgainst = 4.0 * cd(f, d) + cd(uf, c) + cd(c, db) + cd(ff, df) + cd(df, dd);
    float distTowards = 4.0 * cd(c, df) + cd(u, f) + cd(f, dff) + cd(b, d) + cd(d, ddf);
    bool shouldSlice =
        (distAgainst < distTowards)
            || (distAgainst < distTowards + 0.001 && !higher(c, f));

    if (similar4(f, d, b, u) && similar4(uf, df, db, ub) && !similar(c, f)) {
        shouldSlice = false;
    }
    if (!shouldSlice) return vec4(-1.0);

    float dist = 1.0;
    bool flip = false;
    vec2 center = vec2(0.5, 0.5);

    #ifdef SLOPE
    // 2:1 slope cases, cleanup conditions etc.
    if (similar3(f, d, db) && !similar3(f, d, b) && !similar(uf, db)) {
        if (similar(c, df) && higher(c, f)) {
            // do nothing
        } else {
            if (higher(c, f)) {
                flip = true;
            }
            if (similar(u, f) && !similar(c, df) && !higher(c, u)) {
                flip = true;
            }
        }

        if (flip) {
            dist = _lineWidth - distToLine(point, center + vec2(1.5, -1.0) * pointDir, center + vec2(-0.5, 0.0) * pointDir, -pointDir);
        } else {
            dist = distToLine(point, center + vec2(1.5, 0.0) * pointDir, center + vec2(-0.5, 1.0) * pointDir, pointDir);
        }

        #ifdef CLEANUP
        if (!flip && similar(c, uf) && !(similar3(c, uf, uff) && !similar3(c, uf, ff) && !similar(d, uff))) {
            float dist2 = distToLine(point, center + vec2(2.0, -1.0) * pointDir, center + vec2(-0.0, 1.0) * pointDir, pointDir);
            dist = min(dist, dist2);
        }
        #endif

        dist -= (_lineWidth / 2.0);
        return dist <= 0.0 ? ((cd(c, f) <= cd(c, d)) ? f : d) : vec4(-1.0);
    } else if (similar3(uf, f, d) && !similar3(u, f, d) && !similar(uf, db)) {
        if (similar(c, df) && higher(c, d)) {
            // do nothing
        } else {
            if (higher(c, d)) {
                flip = true;
            }
            if (similar(b, d) && !similar(c, df) && !higher(c, d)) {
                flip = true;
            }
        }

        if (flip) {
            dist = _lineWidth - distToLine(point, center + vec2(0.0, -0.5) * pointDir, center + vec2(-1.0, 1.5) * pointDir, -pointDir);
        } else {
            dist = distToLine(point, center + vec2(1.0, -0.5) * pointDir, center + vec2(0.0, 1.5) * pointDir, pointDir);
        }

        #ifdef CLEANUP
        if (!flip && similar(c, db) && !(similar3(c, db, ddb) && !similar3(c, db, dd) && !similar(f, ddb))) {
            float dist2 = distToLine(point, center + vec2(1.0, 0.0) * pointDir, center + vec2(-1.0, 2.0) * pointDir, pointDir);
            dist = min(dist, dist2);
        }
        #endif

        dist -= (_lineWidth / 2.0);
        return dist <= 0.0 ? ((cd(c, f) <= cd(c, d)) ? f : d) : vec4(-1.0);
    } else
    #endif
    if (similar(f, d)) { //45 diagonal
        if (similar(c, df) && higher(c, f)) {
            if (!similar(c, dd) && !similar(c, ff)) {
                flip = true;
            }
        } else {
            if (higher(c, f)) {
                flip = true;
            }
            if (!similar(c, b) && similar4(b, f, d, u)) {
                flip = true;
            }
        }
        if ((((similar(f, db) && similar3(u, f, df)) || (similar(uf, d) && similar3(b, d, df))) && !similar(c, df))) {
            flip = true;
        }

        if (flip) {
            dist = _lineWidth - distToLine(point, center + vec2(1.0, -1.0) * pointDir, center + vec2(-1.0, 1.0) * pointDir, -pointDir);
        } else {
            dist = distToLine(point, center + vec2(1.0, 0.0) * pointDir, center + vec2(0.0, 1.0) * pointDir, pointDir);
        }

        #ifdef SLOPE
        #ifdef CLEANUP
        if (!flip && similar3(c, uf, uff) && !similar3(c, uf, ff) && !similar(d, uff)) {
            float dist2 = distToLine(point, center + vec2(1.5, 0.0) * pointDir, center + vec2(-0.5, 1.0) * pointDir, pointDir);
            dist = max(dist, dist2);
        }

        if (!flip && similar3(ddb, db, c) && !similar3(dd, db, c) && !similar(ddb, f)) {
            float dist2 = distToLine(point, center + vec2(1.0, -0.5) * pointDir, center + vec2(0.0, 1.5) * pointDir, pointDir);
            dist = max(dist, dist2);
        }
        #endif
        #endif

        dist -= (_lineWidth / 2.0);
        return dist <= 0.0 ? ((cd(c, f) <= cd(c, d)) ? f : d) : vec4(-1.0);
    }
    #ifdef SLOPE
    else if (similar3(ff, df, d) && !similar3(ff, df, c) && !similar(uff, d)) {
        if (similar(f, dff) && higher(f, ff)) {
            // do nothing
        } else {
            if (higher(f, ff)) {
                flip = true;
            }
            if (similar(uf, ff) && !similar(f, dff) && !higher(f, uf)) {
                flip = true;
            }
        }
        if (flip) {
            dist = _lineWidth - distToLine(point, center + vec2(2.5, -1.0) * pointDir, center + vec2(0.5, 0.0) * pointDir, -pointDir);
        } else {
            dist = distToLine(point, center + vec2(2.5, 0.0) * pointDir, center + vec2(0.5, 1.0) * pointDir, pointDir);
        }

        dist -= (_lineWidth / 2.0);
        return dist <= 0.0 ? ((cd(f, ff) <= cd(f, df)) ? ff : df) : vec4(-1.0);
    } else if (similar3(f, df, dd) && !similar3(c, df, dd) && !similar(f, ddb)) {
        if (similar(d, ddf) && higher(d, dd)) {
            // do nothing
        } else {
            if (higher(d, dd)) {
                flip = true;
            }
            if (similar(db, dd) && !similar(d, ddf) && !higher(d, dd)) {
                flip = true;
            }
        }

        if (flip) {
            dist = _lineWidth - distToLine(point, center + vec2(0.0, 0.5) * pointDir, center + vec2(-1.0, 2.5) * pointDir, -pointDir);
        } else {
            dist = distToLine(point, center + vec2(1.0, 0.5) * pointDir, center + vec2(0.0, 2.5) * pointDir, pointDir);
        }
        dist -= (_lineWidth / 2.0);
        return dist <= 0.0 ? ((cd(d, df) <= cd(d, dd)) ? df : dd) : vec4(-1.0);
    }
    #endif
    return vec4(-1.0);
}

void main(void) {
    vec2 fragCoord = vTextureCoord * uResolution;
    vec2 size = uResolution + 0.0001;
    vec2 px = fragCoord / uResolution * size;
    vec2 local = fract(px);
    px = ceil(px);

    vec2 pointDir = round(local) * 2.0 - 1.0;

    vec4 uub = texture(uTexture, (px + vec2(-1.0, -2.0) * pointDir) / size);
    vec4 uu = texture(uTexture, (px + vec2(0.0, -2.0) * pointDir) / size);
    vec4 uuf = texture(uTexture, (px + vec2(1.0, -2.0) * pointDir) / size);

    vec4 ubb = texture(uTexture, (px + vec2(-2.0, -2.0) * pointDir) / size);
    vec4 ub = texture(uTexture, (px + vec2(-1.0, -1.0) * pointDir) / size);
    vec4 u = texture(uTexture, (px + vec2(0.0, -1.0) * pointDir) / size);
    vec4 uf = texture(uTexture, (px + vec2(1.0, -1.0) * pointDir) / size);
    vec4 uff = texture(uTexture, (px + vec2(2.0, -1.0) * pointDir) / size);

    vec4 bb = texture(uTexture, (px + vec2(-2.0, 0.0) * pointDir) / size);
    vec4 b = texture(uTexture, (px + vec2(-1.0, 0.0) * pointDir) / size);
    vec4 c = texture(uTexture, (px + vec2(0.0, 0.0) * pointDir) / size);
    vec4 f = texture(uTexture, (px + vec2(1.0, 0.0) * pointDir) / size);
    vec4 ff = texture(uTexture, (px + vec2(2.0, 0.0) * pointDir) / size);

    vec4 dbb = texture(uTexture, (px + vec2(-2.0, 1.0) * pointDir) / size);
    vec4 db = texture(uTexture, (px + vec2(-1.0, 1.0) * pointDir) / size);
    vec4 d = texture(uTexture, (px + vec2(0.0, 1.0) * pointDir) / size);
    vec4 df = texture(uTexture, (px + vec2(1.0, 1.0) * pointDir) / size);
    vec4 dff = texture(uTexture, (px + vec2(2.0, 1.0) * pointDir) / size);

    vec4 ddb = texture(uTexture, (px + vec2(-1.0, 2.0) * pointDir) / size);
    vec4 dd = texture(uTexture, (px + vec2(0.0, 2.0) * pointDir) / size);
    vec4 ddf = texture(uTexture, (px + vec2(1.0, 2.0) * pointDir) / size);

    vec4 col = c;

    vec4 c_col = sliceDist(local, vec2(1.0, 1.0), pointDir, ub, u, uf, uff, b, c, f, ff, db, d, df, dff, ddb, dd, ddf);
    vec4 b_col = sliceDist(local, vec2(-1.0, 1.0), pointDir, uf, u, ub, ubb, f, c, b, bb, df, d, db, dbb, ddf, dd, ddb);
    vec4 u_col = sliceDist(local, vec2(1.0, -1.0), pointDir, db, d, df, dff, b, c, f, ff, ub, u, uf, uff, uub, uu, uuf);

    if (c_col.r >= 0.0) {
        col = c_col;
    }
    if (b_col.r >= 0.0) {
        col = b_col;
    }
    if (u_col.r >= 0.0) {
        col = u_col;
    }

    fragColor = col;
}
