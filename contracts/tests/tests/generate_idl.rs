use sails_rs::generate_idl_to_file;
use std::path::PathBuf;

#[test]
fn test_generate_idl() {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let idl_path = PathBuf::from(manifest_dir)
        .join("../client/blutoken.idl");

    generate_idl_to_file::<blutoken_app::BluTokenProgram>(&idl_path)
        .expect("failed to generate blutoken IDL");

    let idl_content = std::fs::read_to_string(&idl_path)
        .expect("failed to read generated IDL");

    assert!(idl_content.contains("service Admin {"));
    assert!(idl_content.contains("service Bluvft {"));
    assert!(idl_content.contains("GrantRole : (who: actor_id, role: Role, org_id: opt u32) -> result (null, Error);"));
    assert!(idl_content.contains("Transfer : (to: actor_id, amount: u128) -> result (bool, Error);"));
    assert!(idl_content.contains("TotalSupply : () -> u128;"));
}
