use axum::{routing::get_service, Router};
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request};
use hyper_util::rt::TokioIo;
use std::{
    net::SocketAddr,
    path::PathBuf,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, State};
use tokio::net::TcpListener;
use tokio::sync::Notify;
use tower::util::ServiceExt;
use tower_http::services::ServeDir;

// State to manage server lifecycle
struct ServerState {
    notify: Arc<Notify>,
}

impl ServerState {
    fn new(notify: Arc<Notify>) -> Self {
        Self { notify }
    }
}

#[tauri::command]
async fn start_server(
    app: AppHandle,
    path: String,
    state: State<'_, Arc<Mutex<Option<ServerState>>>>,
) -> Result<String, String> {
    use tauri_plugin_fs::FsExt;

    let dir_path = PathBuf::from(&path);

    // Allow directory access
    println!("Allowing access to server directory: {:?}", dir_path);
    app.fs_scope()
        .allow_directory(&dir_path, true)
        .map_err(|err| format!("Failed to allow directory: {}", err))?;
    println!("Access allowed");

    if !dir_path.exists() || !dir_path.is_dir() {
        return Err("Invalid directory path".into());
    }

    // Check if a server is already running
    let mut state_guard = state.lock().unwrap();
    if state_guard.is_some() {
        return Err("Server is already running".into());
    }

    // Initialize server shutdown notifier
    let notify = Arc::new(Notify::new());
    let notify_clone = notify.clone();

    // Spawn the Axum server
    let dir_path_clone = dir_path.clone();
    tauri::async_runtime::spawn(async move {
        let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
        let listener = TcpListener::bind(addr)
            .await
            .expect("Failed to bind to address");

        println!("Serving static files at http://{}", addr);

        loop {
            let (stream, _) = match listener.accept().await {
                Ok(s) => s,
                Err(e) => {
                    eprintln!("Failed to accept connection: {}", e);
                    continue;
                }
            };

            use axum::response::IntoResponse;

            let service =
                get_service(ServeDir::new(dir_path_clone.clone())).handle_error(|_| async move {
                    (
                        hyper::StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal Server Error",
                    )
                        .into_response()
                });

            let app = Router::new().nest_service("/", service);

            let io = TokioIo::new(stream);
            let notify_clone = notify_clone.clone();

            tokio::spawn(async move {
                if let Err(e) = http1::Builder::new()
                    .serve_connection(io, service_fn(|req: Request<_>| app.clone().oneshot(req)))
                    .await
                {
                    eprintln!("Error serving connection: {:?}", e);
                }
                notify_clone.notified().await;
            });
        }
    });

    *state_guard = Some(ServerState::new(notify));

    Ok("Server started at http://127.0.0.1:3000".into())
}

#[tauri::command]
async fn stop_server(state: State<'_, Arc<Mutex<Option<ServerState>>>>) -> Result<String, String> {
    let mut state_guard = state.lock().unwrap();
    if let Some(server_state) = state_guard.take() {
        println!("Stopping server...");
        server_state.notify.notify_one();
        Ok("Server stopped successfully".into())
    } else {
        Err("No server is currently running".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Arc::new(Mutex::new(None::<ServerState>)))
        .invoke_handler(tauri::generate_handler![start_server, stop_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
