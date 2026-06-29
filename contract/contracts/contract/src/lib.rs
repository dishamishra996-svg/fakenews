#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContentItem {
    pub id: String,
    pub content_hash: String,
    pub content_type: String,
    pub submitter: Address,
    pub trust_score: u32,
    pub verification_count: u32,
    pub report_count: u32,
    pub status: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TrustedSource {
    pub name: String,
    pub url: String,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Verification {
    pub verifier: Address,
    pub score: u32,
}

#[contracttype]
pub enum DataKey {
    Content(String),
    TrustedSource(Address),
    Reports(String),
    Reputation(Address),
    Verifications(String),
    Admin,
    Initialized,
    ContentCount,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    ContentNotFound = 3,
    AlreadyVerified = 4,
    AlreadyReported = 5,
    NotTrusted = 6,
    AlreadyTrusted = 7,
    Unauthorized = 8,
    InvalidScore = 9,
}

#[contract]
pub struct TrustCheck;

#[contractimpl]
impl TrustCheck {
    pub fn initialize(env: Env, admin: Address) {
        assert!(!env.storage().instance().has(&DataKey::Initialized), "already initialized");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        env.storage().instance().set(&DataKey::ContentCount, &0u32);
        env.storage().instance().extend_ttl(5000, 10000);
    }

    pub fn submit_content(
        env: Env,
        submitter: Address,
        content_id: String,
        content_hash: String,
        content_type: String,
    ) {
        assert!(env.storage().instance().get::<_, bool>(&DataKey::Initialized).unwrap_or(false), "not init");
        submitter.require_auth();
        assert!(!env.storage().persistent().has(&DataKey::Content(content_id.clone())), "exists");

        let timestamp = env.ledger().timestamp();
        let item = ContentItem {
            id: content_id.clone(),
            content_hash,
            content_type,
            submitter: submitter.clone(),
            trust_score: 50,
            verification_count: 0,
            report_count: 0,
            status: String::from_str(&env, "pending"),
            timestamp,
        };
        env.storage().persistent().set(&DataKey::Content(content_id), &item);

        let count: u32 = env.storage().instance().get(&DataKey::ContentCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::ContentCount, &(count + 1));

        // Award reputation for submitting
        let rep: u32 = env.storage().persistent().get(&DataKey::Reputation(submitter.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Reputation(submitter), &(rep + 10));
    }

    pub fn verify_content(
        env: Env,
        verifier: Address,
        content_id: String,
        trust_score: u32,
    ) -> ContentItem {
        assert!(env.storage().instance().get::<_, bool>(&DataKey::Initialized).unwrap_or(false), "not init");
        verifier.require_auth();
        assert!(trust_score <= 100, "score 0-100");

        let mut content: ContentItem = env.storage().persistent()
            .get(&DataKey::Content(content_id.clone()))
            .expect("not found");

        // Check if verifier already voted
        let verifications: Vec<Verification> = env.storage().persistent()
            .get(&DataKey::Verifications(content_id.clone()))
            .unwrap_or(Vec::new(&env));

        for v in verifications.iter() {
            assert!(v.verifier != verifier, "already verified");
        }

        let mut new_verifications = verifications;
        new_verifications.push_back(Verification { verifier: verifier.clone(), score: trust_score });

        // Recalculate average
        let mut total: u32 = 0;
        for v in new_verifications.iter() {
            total += v.score;
        }
        let avg = total / new_verifications.len();

        content.verification_count = new_verifications.len();
        content.trust_score = avg;

        // Auto-set status based on score
        if avg >= 70 {
            content.status = String::from_str(&env, "verified");
        } else if avg <= 30 {
            content.status = String::from_str(&env, "falsified");
        } else {
            content.status = String::from_str(&env, "disputed");
        }

        env.storage().persistent().set(&DataKey::Verifications(content_id.clone()), &new_verifications);
        env.storage().persistent().set(&DataKey::Content(content_id), &content);

        // Award reputation for verifying
        let rep: u32 = env.storage().persistent().get(&DataKey::Reputation(verifier.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Reputation(verifier), &(rep + 5));

        content
    }

    pub fn report_content(env: Env, reporter: Address, content_id: String) {
        assert!(env.storage().instance().get::<_, bool>(&DataKey::Initialized).unwrap_or(false), "not init");
        reporter.require_auth();

        let mut content: ContentItem = env.storage().persistent()
            .get(&DataKey::Content(content_id.clone()))
            .expect("not found");

        let mut reporters: Vec<Address> = env.storage().persistent()
            .get(&DataKey::Reports(content_id.clone()))
            .unwrap_or(Vec::new(&env));

        for r in reporters.iter() {
            assert!(r != reporter, "already reported");
        }

        reporters.push_back(reporter.clone());
        content.report_count = reporters.len();

        // If reported by 3+ people, flag status
        if reporters.len() >= 3 && content.trust_score > 30 {
            content.status = String::from_str(&env, "disputed");
            // Drop score for reports
            let new_score = if content.trust_score > 20 { content.trust_score - 10 } else { 0 };
            content.trust_score = new_score;
        }

        env.storage().persistent().set(&DataKey::Reports(content_id.clone()), &reporters);
        env.storage().persistent().set(&DataKey::Content(content_id), &content);
    }

    pub fn get_content(env: Env, content_id: String) -> ContentItem {
        assert!(env.storage().instance().get::<_, bool>(&DataKey::Initialized).unwrap_or(false), "not init");
        env.storage().persistent()
            .get(&DataKey::Content(content_id))
            .expect("content not found")
    }

    pub fn add_trusted_source(env: Env, admin: Address, source: Address, name: String, url: String) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not init");
        assert_eq!(admin, stored_admin, "unauthorized");
        assert!(!env.storage().persistent().has(&DataKey::TrustedSource(source.clone())), "already exists");

        let ts = TrustedSource { name, url, active: true };
        env.storage().persistent().set(&DataKey::TrustedSource(source), &ts);
    }

    pub fn remove_trusted_source(env: Env, admin: Address, source: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not init");
        assert_eq!(admin, stored_admin, "unauthorized");
        env.storage().persistent().remove(&DataKey::TrustedSource(source));
    }

    pub fn is_trusted_source(env: Env, source: Address) -> bool {
        env.storage().persistent().has(&DataKey::TrustedSource(source))
    }

    pub fn get_trusted_source(env: Env, source: Address) -> TrustedSource {
        env.storage().persistent()
            .get(&DataKey::TrustedSource(source))
            .expect("not found")
    }

    pub fn get_reputation(env: Env, user: Address) -> u32 {
        env.storage().persistent()
            .get(&DataKey::Reputation(user))
            .unwrap_or(0)
    }

    pub fn get_content_count(env: Env) -> u32 {
        env.storage().instance()
            .get(&DataKey::ContentCount)
            .unwrap_or(0)
    }

    pub fn get_verifications(env: Env, content_id: String) -> Vec<Verification> {
        env.storage().persistent()
            .get(&DataKey::Verifications(content_id))
            .unwrap_or(Vec::new(&env))
    }
}

mod test;
