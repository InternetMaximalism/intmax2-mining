use crate::processor::Processor;
use std::sync::{Arc, OnceLock};

pub struct AppState {
    pub processor: Arc<OnceLock<Processor>>,
}

impl AppState {
    pub fn new() -> Self {
        let processor = Arc::new(OnceLock::new());
        let _: tokio::task::JoinHandle<()> = tokio::spawn(build_circuits(Arc::clone(&processor)));
        Self { processor }
    }
}

impl Clone for AppState {
    fn clone(&self) -> Self {
        Self {
            processor: Arc::clone(&self.processor),
        }
    }
}

async fn build_circuits(processor_state: Arc<OnceLock<Processor>>) {
    let processor = Processor::new();
    log::info!("The claim circuit build has been completed.");
    let _ = processor_state.get_or_init(|| processor);
}
