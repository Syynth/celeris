use std::path::PathBuf;
use tauri::AppHandle;

#[tauri::command]
async fn allow_project_directory(app: AppHandle, path: String) -> Result<(), String> {
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

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![allow_project_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
