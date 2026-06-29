#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String, Address};
use soroban_sdk::testutils::Address as _;

fn setup() -> (Env, TrustCheckClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TrustCheck, ());
    let client = TrustCheckClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

fn cid(env: &Env, s: &str) -> String {
    String::from_str(env, s)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TrustCheck, ());
    let client = TrustCheckClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(&admin);
    assert_eq!(client.get_content_count(), 0);
}

#[test]
#[should_panic(expected = "HostError: Error(WasmVm, InvalidAction)")]
fn test_initialize_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TrustCheck, ());
    let client = TrustCheckClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(&admin);
    client.initialize(&admin);
}

#[test]
fn test_submit_and_get_content() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash123"),
        &cid(&env, "text"),
    );

    let content = client.get_content(&content_id);
    assert_eq!(content.id, content_id);
    assert_eq!(content.content_hash, cid(&env, "hash123"));
    assert_eq!(content.content_type, cid(&env, "text"));
    assert_eq!(content.submitter, submitter);
    assert_eq!(content.trust_score, 50);
    assert_eq!(content.verification_count, 0);
    assert_eq!(content.status, cid(&env, "pending"));
    assert_eq!(client.get_content_count(), 1);
}

#[test]
fn test_verify_content() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let verifier = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash123"),
        &cid(&env, "text"),
    );

    let content = client.verify_content(&verifier, &content_id, &85);
    assert_eq!(content.trust_score, 85);
    assert_eq!(content.verification_count, 1);
    assert_eq!(content.status, cid(&env, "verified"));

    // Second verifier
    let verifier2 = Address::generate(&env);
    let content = client.verify_content(&verifier2, &content_id, &75);
    assert_eq!(content.trust_score, 80); // (85+75)/2 = 80
    assert_eq!(content.verification_count, 2);
}

#[test]
fn test_verify_content_falsified() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let verifier = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash456"),
        &cid(&env, "image"),
    );

    let content = client.verify_content(&verifier, &content_id, &10);
    assert_eq!(content.trust_score, 10);
    assert_eq!(content.status, cid(&env, "falsified"));
}

#[test]
fn test_report_content() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash789"),
        &cid(&env, "video"),
    );

    let reporter1 = Address::generate(&env);
    let reporter2 = Address::generate(&env);
    let reporter3 = Address::generate(&env);

    // First report
    client.report_content(&reporter1, &content_id);
    let content = client.get_content(&content_id);
    assert_eq!(content.report_count, 1);

    // Second report
    client.report_content(&reporter2, &content_id);
    let content = client.get_content(&content_id);
    assert_eq!(content.report_count, 2);

    // Third report should change status
    client.report_content(&reporter3, &content_id);
    let content = client.get_content(&content_id);
    assert_eq!(content.report_count, 3);
    assert_eq!(content.trust_score, 40); // 50 - 10
}

#[test]
fn test_trusted_sources() {
    let (env, client, admin) = setup();
    let source_addr = Address::generate(&env);

    client.add_trusted_source(
        &admin,
        &source_addr,
        &cid(&env, "Reuters"),
        &cid(&env, "https://reuters.com"),
    );

    assert!(client.is_trusted_source(&source_addr));
    let source = client.get_trusted_source(&source_addr);
    assert_eq!(source.name, cid(&env, "Reuters"));
    assert_eq!(source.url, cid(&env, "https://reuters.com"));
    assert!(source.active);

    // Remove
    client.remove_trusted_source(&admin, &source_addr);
    assert!(!client.is_trusted_source(&source_addr));
}

#[test]
fn test_user_reputation() {
    let (env, client, _admin) = setup();
    let user = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    // Submit content gives 10 reputation
    client.submit_content(
        &user,
        &content_id,
        &cid(&env, "hash999"),
        &cid(&env, "text"),
    );
    assert_eq!(client.get_reputation(&user), 10);

    // Verify gives 5 more
    let verifier = Address::generate(&env);
    client.verify_content(&verifier, &content_id, &80);
    assert_eq!(client.get_reputation(&verifier), 5);
}

#[test]
#[should_panic(expected = "HostError: Error(WasmVm, InvalidAction)")]
fn test_get_nonexistent_content() {
    let (env, client, _admin) = setup();
    client.get_content(&cid(&env, "NONEXISTENT"));
}

#[test]
#[should_panic(expected = "HostError: Error(WasmVm, InvalidAction)")]
fn test_invalid_score() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let verifier = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash"),
        &cid(&env, "text"),
    );
    client.verify_content(&verifier, &content_id, &200);
}

#[test]
fn test_multiple_content_submissions() {
    let (env, client, _admin) = setup();
    let user = Address::generate(&env);

    let ids = ["CONTENT-001", "CONTENT-002", "CONTENT-003", "CONTENT-004", "CONTENT-005"];
    let hashes = ["hash1", "hash2", "hash3", "hash4", "hash5"];

    for i in 0..5 {
        client.submit_content(
            &user,
            &cid(&env, ids[i]),
            &cid(&env, hashes[i]),
            &cid(&env, "text"),
        );
    }

    assert_eq!(client.get_content_count(), 5);
}

#[test]
fn test_get_verifications() {
    let (env, client, _admin) = setup();
    let submitter = Address::generate(&env);
    let verifier1 = Address::generate(&env);
    let verifier2 = Address::generate(&env);
    let content_id = cid(&env, "CONTENT-001");

    client.submit_content(
        &submitter,
        &content_id,
        &cid(&env, "hash"),
        &cid(&env, "text"),
    );

    client.verify_content(&verifier1, &content_id, &90);
    client.verify_content(&verifier2, &content_id, &70);

    let verifications = client.get_verifications(&content_id);
    assert_eq!(verifications.len(), 2);
}

#[test]
#[should_panic(expected = "HostError: Error(WasmVm, InvalidAction)")]
fn test_call_before_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TrustCheck, ());
    let client = TrustCheckClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    client.submit_content(
        &user,
        &cid(&env, "CONTENT-001"),
        &cid(&env, "hash"),
        &cid(&env, "text"),
    );
}
