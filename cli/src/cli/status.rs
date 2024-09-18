use console::Term;
use log::info;

/// Print a status message to the console
/// This will overwrite the last line
pub fn print_status(message: &str) {
    let term = Term::stdout();
    term.clear_last_lines(1).unwrap();
    term.write_line(message).unwrap();

    info!("Status: {}", message);
}
