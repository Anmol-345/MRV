use std::process::Command;
use std::env;

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.is_empty() {
        return;
    }
    let rustc = &args[0];
    let mut cmd = Command::new(rustc);
    let mut is_wasm = false;
    for arg in &args[1..] {
        if arg.contains("wasm32-unknown-unknown") {
            is_wasm = true;
        }
        cmd.arg(arg);
    }
    if is_wasm {
        cmd.arg("-C");
        cmd.arg("link-arg=--import-undefined");
    }
    let status = cmd.status().expect("failed to execute rustc");
    std::process::exit(status.code().unwrap_or(1));
}
