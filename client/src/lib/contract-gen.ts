import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  u64,
} from "@stellar/stellar-sdk/contract";

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC4B2R7WFWLWFMRGDESZWXQD2OBZHZFD6LP2NVO2C25THLM7CTQGLM6A",
  }
} as const;

export const Errors = {
  1: {message:"NotInitialized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"ContentNotFound"},
  4: {message:"AlreadyVerified"},
  5: {message:"AlreadyReported"},
  6: {message:"NotTrusted"},
  7: {message:"AlreadyTrusted"},
  8: {message:"Unauthorized"},
  9: {message:"InvalidScore"}
};

export interface ContentItem {
  content_hash: string;
  content_type: string;
  id: string;
  report_count: u32;
  status: string;
  submitter: string;
  timestamp: u64;
  trust_score: u32;
  verification_count: u32;
}

export interface Verification {
  score: u32;
  verifier: string;
}

export interface TrustedSource {
  active: boolean;
  name: string;
  url: string;
}

export interface Client {
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  get_content: ({content_id}: {content_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<ContentItem>>;
  get_reputation: ({user}: {user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
  report_content: ({reporter, content_id}: {reporter: string, content_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  submit_content: ({submitter, content_id, content_hash, content_type}: {submitter: string, content_id: string, content_hash: string, content_type: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  verify_content: ({verifier, content_id, trust_score}: {verifier: string, content_id: string, trust_score: u32}, options?: MethodOptions) => Promise<AssembledTransaction<ContentItem>>;
  get_content_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
  get_verifications: ({content_id}: {content_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<Verification>>>;
  is_trusted_source: ({source}: {source: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
  add_trusted_source: ({admin, source, name, url}: {admin: string, source: string, name: string, url: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
  get_trusted_source: ({source}: {source: string}, options?: MethodOptions) => Promise<AssembledTransaction<TrustedSource>>;
  remove_trusted_source: ({admin, source}: {admin: string, source: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACQAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAPQ29udGVudE5vdEZvdW5kAAAAAAMAAAAAAAAAD0FscmVhZHlWZXJpZmllZAAAAAAEAAAAAAAAAA9BbHJlYWR5UmVwb3J0ZWQAAAAABQAAAAAAAAAKTm90VHJ1c3RlZAAAAAAABgAAAAAAAAAOQWxyZWFkeVRydXN0ZWQAAAAAAAcAAAAAAAAADFVuYXV0aG9yaXplZAAAAAgAAAAAAAAADEludmFsaWRTY29yZQAAAAk=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACAAAAAEAAAAAAAAAB0NvbnRlbnQAAAAAAQAAABAAAAABAAAAAAAAAA1UcnVzdGVkU291cmNlAAAAAAAAAQAAABMAAAABAAAAAAAAAAdSZXBvcnRzAAAAAAEAAAAQAAAAAQAAAAAAAAAKUmVwdXRhdGlvbgAAAAAAAQAAABMAAAABAAAAAAAAAA1WZXJpZmljYXRpb25zAAAAAAAAAQAAABAAAAAAAAAAAAAAAAVBZG1pbgAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAAAAAAAAAAADENvbnRlbnRDb3VudA==",
        "AAAAAQAAAAAAAAAAAAAAC0NvbnRlbnRJdGVtAAAAAAkAAAAAAAAADGNvbnRlbnRfaGFzaAAAABAAAAAAAAAADGNvbnRlbnRfdHlwZQAAABAAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAxyZXBvcnRfY291bnQAAAAEAAAAAAAAAAZzdGF0dXMAAAAAABAAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAAAAAAAC3RydXN0X3Njb3JlAAAAAAQAAAAAAAAAEnZlcmlmaWNhdGlvbl9jb3VudAAAAAAABA==",
        "AAAAAQAAAAAAAAAAAAAADFZlcmlmaWNhdGlvbgAAAAIAAAAAAAAABXNjb3JlAAAAAAAABAAAAAAAAAAIdmVyaWZpZXIAAAAT",
        "AAAAAQAAAAAAAAAAAAAADVRydXN0ZWRTb3VyY2UAAAAAAAADAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAALZ2V0X2NvbnRlbnQAAAAAAQAAAAAAAAAKY29udGVudF9pZAAAAAAAEAAAAAEAAAfQAAAAC0NvbnRlbnRJdGVtAA==",
        "AAAAAAAAAAAAAAAOZ2V0X3JlcHV0YXRpb24AAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAOcmVwb3J0X2NvbnRlbnQAAAAAAAIAAAAAAAAACHJlcG9ydGVyAAAAEwAAAAAAAAAKY29udGVudF9pZAAAAAAAEAAAAAA=",
        "AAAAAAAAAAAAAAAOc3VibWl0X2NvbnRlbnQAAAAAAAQAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAACmNvbnRlbnRfaWQAAAAAABAAAAAAAAAADGNvbnRlbnRfaGFzaAAAABAAAAAAAAAADGNvbnRlbnRfdHlwZQAAABAAAAAA",
        "AAAAAAAAAAAAAAAOdmVyaWZ5X2NvbnRlbnQAAAAAAAMAAAAAAAAACHZlcmlmaWVyAAAAEwAAAAAAAAAKY29udGVudF9pZAAAAAAAEAAAAAAAAAALdHJ1c3Rfc2NvcmUAAAAABAAAAAEAAAfQAAAAC0NvbnRlbnRJdGVtAA==",
        "AAAAAAAAAAAAAAARZ2V0X2NvbnRlbnRfY291bnQAAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAARZ2V0X3ZlcmlmaWNhdGlvbnMAAAAAAAABAAAAAAAAAApjb250ZW50X2lkAAAAAAAQAAAAAQAAA+oAAAfQAAAADFZlcmlmaWNhdGlvbg==",
        "AAAAAAAAAAAAAAARaXNfdHJ1c3RlZF9zb3VyY2UAAAAAAAABAAAAAAAAAAZzb3VyY2UAAAAAABMAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAASYWRkX3RydXN0ZWRfc291cmNlAAAAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABnNvdXJjZQAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAAA3VybAAAAAAQAAAAAA==",
        "AAAAAAAAAAAAAAASZ2V0X3RydXN0ZWRfc291cmNlAAAAAAABAAAAAAAAAAZzb3VyY2UAAAAAABMAAAABAAAH0AAAAA1UcnVzdGVkU291cmNlAAAA",
        "AAAAAAAAAAAAAAAVcmVtb3ZlX3RydXN0ZWRfc291cmNlAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZzb3VyY2UAAAAAABMAAAAA"
      ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
    get_content: this.txFromJSON<ContentItem>,
    get_reputation: this.txFromJSON<u32>,
    report_content: this.txFromJSON<null>,
    submit_content: this.txFromJSON<null>,
    verify_content: this.txFromJSON<ContentItem>,
    get_content_count: this.txFromJSON<u32>,
    get_verifications: this.txFromJSON<Array<Verification>>,
    is_trusted_source: this.txFromJSON<boolean>,
    add_trusted_source: this.txFromJSON<null>,
    get_trusted_source: this.txFromJSON<TrustedSource>,
    remove_trusted_source: this.txFromJSON<null>
  }
}
