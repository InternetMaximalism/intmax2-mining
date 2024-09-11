pub mod parser;
#[cfg(test)]
mod tests {
    use std::fs::File;

    use csv::Reader;

    #[test]
    fn read_csv() -> anyhow::Result<()> {
        let file = File::open("data/mainWithdrawals.csv")?;
        let mut rdr = Reader::from_reader(file);
        for result in rdr.records() {
            let record = result?;
            println!("{:?}", record);
        }

        Ok(())
    }
}
