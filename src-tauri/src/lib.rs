#[tauri::command]
fn allow_dir(app: tauri::AppHandle, path: std::path::PathBuf) -> Result<(), String> {
    use tauri_plugin_fs::FsExt;

    println!("allowing access to {path:?}");

    app.fs_scope()
        .allow_directory(path.parent().unwrap_or(&path), true)
        .map_err(|err| err.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![allow_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
