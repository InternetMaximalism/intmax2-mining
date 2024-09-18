use console::{style, Term};
use log::info;

/// Print a colored status message to the console
/// This will overwrite the last line
pub fn print_status(message: &str) {
    let term = Term::stdout();
    term.clear_last_lines(1).unwrap();

    let colored_message = format!(
        "{} {}",
        style("STATUS:").green().bold(),
        style(message).blue()
    );

    term.write_line(&colored_message).unwrap();

    info!("Status: {}", message);
}

pub fn print_error(message: &str) {
    let term = Term::stdout();
    let colored_message = format!("{} {}", style("ERROR:").red().bold(), style(message).red());
    term.write_line(&colored_message).unwrap();
    info!("Error: {}", message);
}
