#[cfg(test)]
mod tests {
    use mining_circuit::eligible_tree::EligibleLeaf;
    use rusqlite::Connection;

    #[test]
    fn write_tree() {
        let max_deposit = 100;
        let mut leaves = Vec::new();
        for i in 0..max_deposit {
            let leaf = EligibleLeaf {
                deposit_index: i,
                amount: 1,
            };
            leaves.push(leaf);
        }

        let conn = Connection::open("eligible_leaves.db").unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS eligible_leaves (
            id INTEGER PRIMARY KEY,
            deposit_index INTEGER NOT NULL,
            amount INTEGER NOT NULL
        )",
            [],
        )
        .unwrap();

        for leaf in leaves.iter() {
            conn.execute(
                "INSERT INTO eligible_leaves (deposit_index, amount) VALUES (?1, ?2)",
                [&leaf.deposit_index, &leaf.amount],
            )
            .unwrap();
        }
    }
}
