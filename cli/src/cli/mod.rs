use availability::check_avaliability;
use dialoguer::Select;

use crate::{
    services::main_loop,
    state::state::{RunMode, State},
};

pub mod availability;
pub mod private_data;
pub mod user_settings;

pub async fn run() -> anyhow::Result<()> {
    let mut state = start().await?;
    main_loop(&mut state).await?;
    Ok(())
}

async fn start() -> anyhow::Result<State> {
    println!("Welcome to the INTMAX mining CLI!");

    // check availability
    check_avaliability().await?;

    // private settings
    let private_data = private_data::set_private_data()?;

    // user settings
    user_settings::user_settings(&private_data).await?;

    // construct state
    let mode = select_mode();
    let mut state = State::new(private_data, mode);
    state.build_circuit()?;

    println!("Startup completed");
    Ok(state)
}

fn select_mode() -> RunMode {
    let items = vec!["Normal", "Shutdown"];
    let selection = Select::new()
        .with_prompt("Choose mode")
        .items(&items)
        .default(0)
        .interact()
        .unwrap();
    match selection {
        0 => RunMode::Normal,
        1 => RunMode::Shutdown,
        _ => unreachable!(),
    }
}
