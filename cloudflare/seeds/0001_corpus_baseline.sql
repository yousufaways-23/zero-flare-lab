-- ZERO FLARE - D1 corpus-baseline seed (deploy-time; runtime reads are parameterized)
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches.json', '[
  {
    "batchId": "B-20261112-001",
    "receivedAt": "2026-11-12T16:58:22.040Z",
    "fileCount": 1
  },
  {
    "batchId": "B-20261112-002",
    "receivedAt": "2026-11-12T20:27:06.375Z",
    "fileCount": 10
  },
  {
    "batchId": "B-20261112-003",
    "receivedAt": "2026-11-12T20:27:28.720Z",
    "fileCount": 9
  },
  {
    "batchId": "B-20261112-004",
    "receivedAt": "2026-11-12T20:58:29.250Z",
    "fileCount": 10
  },
  {
    "batchId": "B-20261112-005",
    "receivedAt": "2026-11-12T20:59:17.112Z",
    "fileCount": 3
  },
  {
    "batchId": "B-20261112-006",
    "receivedAt": "2026-11-12T20:59:47.600Z",
    "fileCount": 10
  },
  {
    "batchId": "B-20261112-007",
    "receivedAt": "2026-11-12T21:00:49.602Z",
    "fileCount": 7
  },
  {
    "batchId": "B-20261113-001",
    "receivedAt": "2026-11-13T15:13:17.001Z",
    "fileCount": 2
  },
  {
    "batchId": "B-20261113-002",
    "receivedAt": "2026-11-13T15:13:47.974Z",
    "fileCount": 1
  },
  {
    "batchId": "B-20261113-003",
    "receivedAt": "2026-11-13T15:15:15.519Z",
    "fileCount": 10
  },
  {
    "batchId": "B-20261113-004",
    "receivedAt": "2026-11-13T15:15:45.035Z",
    "fileCount": 10
  },
  {
    "batchId": "B-20261113-005",
    "receivedAt": "2026-11-13T15:15:47.032Z",
    "fileCount": 5
  }
]', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/cumulative.json', '{
  "batches": 12,
  "files": 78,
  "uniqueFiles": 77,
  "duplicateFiles": 1,
  "documents": 77,
  "pages": 432,
  "chars": 945934,
  "tables": 44,
  "tableRows": 2223,
  "equations": 157,
  "figures": 468,
  "mediaAssets": 216,
  "entities": 116,
  "errors": 0,
  "userConfirmedAllUploads": true,
  "lastBatchId": "B-20261113-005",
  "updatedAt": "2026-11-13T15:15:47.313Z"
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/registry.json', '{
  "version": 1,
  "entries": {
    "bbd16bb7a7f17fbf52ca7d55891a13652927a4c5d1a902c7c9f039ab12603e8a": {
      "sha256": "bbd16bb7a7f17fbf52ca7d55891a13652927a4c5d1a902c7c9f039ab12603e8a",
      "firstSeenBatch": "B-20261112-001",
      "firstSeenName": "test-upload.csv",
      "firstSeenAt": "2026-11-12T16:58:22.061Z",
      "sizeBytes": 362,
      "kind": "csv"
    },
    "4d3c717ec20dd0247db670b2784a9fd7d746788bc54a936f80693e48eb8cd117": {
      "sha256": "4d3c717ec20dd0247db670b2784a9fd7d746788bc54a936f80693e48eb8cd117",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-100_Experimental table_SAFFIRE-3.csv",
      "firstSeenAt": "2026-11-12T20:27:06.390Z",
      "sizeBytes": 239,
      "kind": "csv"
    },
    "87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef": {
      "sha256": "87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-101_Experimental table_SAME-R.csv",
      "firstSeenAt": "2026-11-12T20:27:06.407Z",
      "sizeBytes": 5674,
      "kind": "csv"
    },
    "268d1e121d2f211b124407dd32b9475617bd269ede2c2d1749441da3e949a2af": {
      "sha256": "268d1e121d2f211b124407dd32b9475617bd269ede2c2d1749441da3e949a2af",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-102_Experimental table_SAME.csv",
      "firstSeenAt": "2026-11-12T20:27:06.417Z",
      "sizeBytes": 331,
      "kind": "csv"
    },
    "89ef980810ca6d9aa8be817b42e36cd2adff23f5e9058361b5a33d18b4363f4d": {
      "sha256": "89ef980810ca6d9aa8be817b42e36cd2adff23f5e9058361b5a33d18b4363f4d",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-106_Experimental table_Slice.csv",
      "firstSeenAt": "2026-11-12T20:27:06.428Z",
      "sizeBytes": 734,
      "kind": "csv"
    },
    "fb0d7e60cf5367afb429089e9901d27288f78038efd26c8de1db4fbe04117136": {
      "sha256": "fb0d7e60cf5367afb429089e9901d27288f78038efd26c8de1db4fbe04117136",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-107_Experimental table_Spice.csv",
      "firstSeenAt": "2026-11-12T20:27:06.443Z",
      "sizeBytes": 31205,
      "kind": "csv"
    },
    "97933ee9ae0b9ebc6b948a67485a0fe2f8218f753253a4f2be93c40d374c44e4": {
      "sha256": "97933ee9ae0b9ebc6b948a67485a0fe2f8218f753253a4f2be93c40d374c44e4",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-10_Experimental table_Flame Design_Inverse Flame.csv",
      "firstSeenAt": "2026-11-12T20:27:06.456Z",
      "sizeBytes": 17314,
      "kind": "csv"
    },
    "4a663292bd3f65201943cc71bd661a70383639276a9176f64105b285bf0b6deb": {
      "sha256": "4a663292bd3f65201943cc71bd661a70383639276a9176f64105b285bf0b6deb",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-10_Experimental table_Flame Design_Normal Flame.csv",
      "firstSeenAt": "2026-11-12T20:27:06.471Z",
      "sizeBytes": 26933,
      "kind": "csv"
    },
    "d4d44f8b9896936728748e34d1b6ad0812032a92fa5289599b708c138e3a9b39": {
      "sha256": "d4d44f8b9896936728748e34d1b6ad0812032a92fa5289599b708c138e3a9b39",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
      "firstSeenAt": "2026-11-12T20:27:06.488Z",
      "sizeBytes": 39422,
      "kind": "csv"
    },
    "d95a621c3fbd27d204dd32ed29fa17d68f2b779d6a523cde8479ed7ebaa5251a": {
      "sha256": "d95a621c3fbd27d204dd32ed29fa17d68f2b779d6a523cde8479ed7ebaa5251a",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
      "firstSeenAt": "2026-11-12T20:27:06.504Z",
      "sizeBytes": 22166,
      "kind": "csv"
    },
    "4aa5d3f98708ceacced5c620d46858b9965f8d4d941b203229f46467d53e5ab7": {
      "sha256": "4aa5d3f98708ceacced5c620d46858b9965f8d4d941b203229f46467d53e5ab7",
      "firstSeenBatch": "B-20261112-002",
      "firstSeenName": "PSI-20_Experimental table_ACME BRE.csv",
      "firstSeenAt": "2026-11-12T20:27:06.515Z",
      "sizeBytes": 1113,
      "kind": "csv"
    },
    "9fafbc5b3dddaf715ce8025ed9154ce297803f7b69a935f077ec26c8249e44c0": {
      "sha256": "9fafbc5b3dddaf715ce8025ed9154ce297803f7b69a935f077ec26c8249e44c0",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-21_Experimental table_CLD Flame.csv",
      "firstSeenAt": "2026-11-12T20:27:28.729Z",
      "sizeBytes": 2454,
      "kind": "csv"
    },
    "69090c357b83ae38d161d29001d1d32b40fd77b13324ca6585ee990cdceef524": {
      "sha256": "69090c357b83ae38d161d29001d1d32b40fd77b13324ca6585ee990cdceef524",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-22_Experimental table_ACME E-FIELD Flames.csv",
      "firstSeenAt": "2026-11-12T20:27:28.747Z",
      "sizeBytes": 2475,
      "kind": "csv"
    },
    "16cd10f50bd2e962887c8eb4077e5a9b3e790c78de8e0361c0b77e19300be7cf": {
      "sha256": "16cd10f50bd2e962887c8eb4077e5a9b3e790c78de8e0361c0b77e19300be7cf",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-23_Experimental table_ACME s-Flame.csv",
      "firstSeenAt": "2026-11-12T20:27:28.761Z",
      "sizeBytes": 2456,
      "kind": "csv"
    },
    "71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042": {
      "sha256": "71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-25_Experimental table_BASS-II.csv",
      "firstSeenAt": "2026-11-12T20:27:28.789Z",
      "sizeBytes": 16590,
      "kind": "csv"
    },
    "ccfc3c54d948b64a1c5d2596a63c7c8019e51df0c91a1d62f039f48fa28c300f": {
      "sha256": "ccfc3c54d948b64a1c5d2596a63c7c8019e51df0c91a1d62f039f48fa28c300f",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-26_Experimental table_BASS.csv",
      "firstSeenAt": "2026-11-12T20:27:28.805Z",
      "sizeBytes": 4726,
      "kind": "csv"
    },
    "fb898e28762353aa132c16b886dbd207a024b1dd3c9bed5928d70d8036d2ec7e": {
      "sha256": "fb898e28762353aa132c16b886dbd207a024b1dd3c9bed5928d70d8036d2ec7e",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-39_Experimental table_CFI.csv",
      "firstSeenAt": "2026-11-12T20:27:28.821Z",
      "sizeBytes": 7792,
      "kind": "csv"
    },
    "cc57ad1bd9977aa13e7ac6c3aa618303012686e232b36c052c6a9f1a74e5f528": {
      "sha256": "cc57ad1bd9977aa13e7ac6c3aa618303012686e232b36c052c6a9f1a74e5f528",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-68_Experimental table_Flex2.csv",
      "firstSeenAt": "2026-11-12T20:27:28.833Z",
      "sizeBytes": 1029,
      "kind": "csv"
    },
    "37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96": {
      "sha256": "37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-69_Experimental table_FLEX.csv",
      "firstSeenAt": "2026-11-12T20:27:28.852Z",
      "sizeBytes": 24776,
      "kind": "csv"
    },
    "3c24390b9ef86f3d1ebaab911a1a3cc95a8759aebf42062371370e6d4b31b8ac": {
      "sha256": "3c24390b9ef86f3d1ebaab911a1a3cc95a8759aebf42062371370e6d4b31b8ac",
      "firstSeenBatch": "B-20261112-003",
      "firstSeenName": "PSI-99_Experimental table_SAFFIRE-2.csv",
      "firstSeenAt": "2026-11-12T20:27:28.869Z",
      "sizeBytes": 1973,
      "kind": "csv"
    },
    "7c991819c91a2a7ef6ef4cbcd3614f33f7af4bd1c437d7ba03f6b8abcdd6d32d": {
      "sha256": "7c991819c91a2a7ef6ef4cbcd3614f33f7af4bd1c437d7ba03f6b8abcdd6d32d",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "Combustion Science - NASA.pdf",
      "firstSeenAt": "2026-11-12T20:58:32.732Z",
      "sizeBytes": 11450992,
      "kind": "pdf"
    },
    "d9d22310f1a062b973b1aeb88abe89e051fbe0df85b682fe55f063aec7c50a1b": {
      "sha256": "d9d22310f1a062b973b1aeb88abe89e051fbe0df85b682fe55f063aec7c50a1b",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "Fluids & Combustion Facility - NASA.pdf",
      "firstSeenAt": "2026-11-12T20:58:38.687Z",
      "sizeBytes": 14223429,
      "kind": "pdf"
    },
    "72851a46eea9531aaac1e833070743cd6a6b97529abe96041f905ebe92080119": {
      "sha256": "72851a46eea9531aaac1e833070743cd6a6b97529abe96041f905ebe92080119",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "ISS Fluids and Combustion Facility - Combustion Integrated Rack Operations - ISS Fluids and Combustion Facility - Combustion Integrated Rack Operations.pdf",
      "firstSeenAt": "2026-11-12T20:58:42.106Z",
      "sizeBytes": 979870,
      "kind": "pdf"
    },
    "823f09fbbfb997adb455998a96a6beb745e9aa2684d003e0739120cdb2313bfa": {
      "sha256": "823f09fbbfb997adb455998a96a6beb745e9aa2684d003e0739120cdb2313bfa",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "Microgravity Science Glovebox (MSG) - NASA.pdf",
      "firstSeenAt": "2026-11-12T20:58:44.429Z",
      "sizeBytes": 7706297,
      "kind": "pdf"
    },
    "21d226540a4764db3f55a686daeecdb1d4fb7458502a0f8d2175a0e85ddad853": {
      "sha256": "21d226540a4764db3f55a686daeecdb1d4fb7458502a0f8d2175a0e85ddad853",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "advanced-combustion-via-microgravity-experiments-acme.pdf",
      "firstSeenAt": "2026-11-12T20:58:46.837Z",
      "sizeBytes": 850625,
      "kind": "pdf"
    },
    "a6b5da803a4dfd3e9902ac2013a4495a4712831a86f434e3812e5592822446ac": {
      "sha256": "a6b5da803a4dfd3e9902ac2013a4495a4712831a86f434e3812e5592822446ac",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "burning-and-suppression-of-solids-bass.pdf",
      "firstSeenAt": "2026-11-12T20:58:49.283Z",
      "sizeBytes": 206949,
      "kind": "pdf"
    },
    "cc508885c1871dae87beb0ba8fd8c1f3c02419e468caea836b04d1617d658885": {
      "sha256": "cc508885c1871dae87beb0ba8fd8c1f3c02419e468caea836b04d1617d658885",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "dust-and-aerosol-measurement-feasibility-test-daft.pdf",
      "firstSeenAt": "2026-11-12T20:58:49.928Z",
      "sizeBytes": 94577,
      "kind": "pdf"
    },
    "318b21e5deb17e61d9668cfede6da61d6676e84950aa3d33c5b5f5bf3f1464b2": {
      "sha256": "318b21e5deb17e61d9668cfede6da61d6676e84950aa3d33c5b5f5bf3f1464b2",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "flame-extinguishment-experiment-flex.pdf",
      "firstSeenAt": "2026-11-12T20:58:50.764Z",
      "sizeBytes": 214938,
      "kind": "pdf"
    },
    "18fd998abc3f9f2e8942d998fbaa8207a983add97284cca3419c8b1070a4cdbb": {
      "sha256": "18fd998abc3f9f2e8942d998fbaa8207a983add97284cca3419c8b1070a4cdbb",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "smoke-aerosol-measurement-experiment-same.pdf",
      "firstSeenAt": "2026-11-12T20:58:52.920Z",
      "sizeBytes": 125215,
      "kind": "pdf"
    },
    "ed3905a0a13afe0390b5ed89959cc9f2e21edba5d1a103f2676425a7efa48e9b": {
      "sha256": "ed3905a0a13afe0390b5ed89959cc9f2e21edba5d1a103f2676425a7efa48e9b",
      "firstSeenBatch": "B-20261112-004",
      "firstSeenName": "smoke-point-in-co-flow-experiment-spice.pdf",
      "firstSeenAt": "2026-11-12T20:58:53.589Z",
      "sizeBytes": 114770,
      "kind": "pdf"
    },
    "4eed8a4d5bce284e8d9ec24b637b21fdbf4b1fbbaadb663da3b66ee89faecd5f": {
      "sha256": "4eed8a4d5bce284e8d9ec24b637b21fdbf4b1fbbaadb663da3b66ee89faecd5f",
      "firstSeenBatch": "B-20261112-005",
      "firstSeenName": "spacecraft-fire-safety-demonstration-saffire.pdf",
      "firstSeenAt": "2026-11-12T20:59:17.797Z",
      "sizeBytes": 99155,
      "kind": "pdf"
    },
    "ddc56bd4a9bf46d582fd00e6aed4fbe7c362c1aa6e35a857925fdf7d5a7bc36a": {
      "sha256": "ddc56bd4a9bf46d582fd00e6aed4fbe7c362c1aa6e35a857925fdf7d5a7bc36a",
      "firstSeenBatch": "B-20261112-005",
      "firstSeenName": "structure-liftoff-in-combustion-experiment-slice.pdf",
      "firstSeenAt": "2026-11-12T20:59:18.458Z",
      "sizeBytes": 82627,
      "kind": "pdf"
    },
    "4d0e2f9817837c0382ca99fa1bc86777e358188eaad31666749e5998f0779849": {
      "sha256": "4d0e2f9817837c0382ca99fa1bc86777e358188eaad31666749e5998f0779849",
      "firstSeenBatch": "B-20261112-005",
      "firstSeenName": "20050215648.pdf",
      "firstSeenAt": "2026-11-12T20:59:19.120Z",
      "sizeBytes": 156615,
      "kind": "pdf"
    },
    "2c11df5fccdcce922cabca1f04db971c5f7031ef587fd24563e4b60cd8809671": {
      "sha256": "2c11df5fccdcce922cabca1f04db971c5f7031ef587fd24563e4b60cd8809671",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218021000493-am.pdf",
      "firstSeenAt": "2026-11-12T20:59:49.243Z",
      "sizeBytes": 3292684,
      "kind": "pdf"
    },
    "e905e54e85d0fcc7de61ee3c789c48b7389d5321098a0ae4eaa1f00d76c6a6c4": {
      "sha256": "e905e54e85d0fcc7de61ee3c789c48b7389d5321098a0ae4eaa1f00d76c6a6c4",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218021000821-am.pdf",
      "firstSeenAt": "2026-11-12T20:59:50.215Z",
      "sizeBytes": 658345,
      "kind": "pdf"
    },
    "3080e4075ab43b8d5e99c536d87123636ee1af12eeff75860de067de806931c0": {
      "sha256": "3080e4075ab43b8d5e99c536d87123636ee1af12eeff75860de067de806931c0",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218021003151-am.pdf",
      "firstSeenAt": "2026-11-12T20:59:51.422Z",
      "sizeBytes": 4379618,
      "kind": "pdf"
    },
    "0c9de3335ce1e54de87d08055548731ae244e4b3dac31c7c39a38c86ddeb1702": {
      "sha256": "0c9de3335ce1e54de87d08055548731ae244e4b3dac31c7c39a38c86ddeb1702",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218022000864-am.pdf",
      "firstSeenAt": "2026-11-12T20:59:54.496Z",
      "sizeBytes": 1773048,
      "kind": "pdf"
    },
    "2606d9de843f89b76abba368b22674924d6e0bc5076f11af671d4bb0d1c6e040": {
      "sha256": "2606d9de843f89b76abba368b22674924d6e0bc5076f11af671d4bb0d1c6e040",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218022001742-am.pdf",
      "firstSeenAt": "2026-11-12T20:59:56.105Z",
      "sizeBytes": 1596648,
      "kind": "pdf"
    },
    "63ac2102de3a4b6701490ef05667fc70b888f04d7f765459e2500fd612620562": {
      "sha256": "63ac2102de3a4b6701490ef05667fc70b888f04d7f765459e2500fd612620562",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218022004606-main.pdf",
      "firstSeenAt": "2026-11-12T21:00:01.413Z",
      "sizeBytes": 3406360,
      "kind": "pdf"
    },
    "57ed89eb338a351e1623a75e4872b150bfc9cf60bb9c9f1bd7d6f1fe1e0221f8": {
      "sha256": "57ed89eb338a351e1623a75e4872b150bfc9cf60bb9c9f1bd7d6f1fe1e0221f8",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S0010218023001803-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:03.226Z",
      "sizeBytes": 1811567,
      "kind": "pdf"
    },
    "ba6102d586972deaae52e72f507bab917698fc2a526189dbfecf4eaba62e978e": {
      "sha256": "ba6102d586972deaae52e72f507bab917698fc2a526189dbfecf4eaba62e978e",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S001021802300233X-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:04.404Z",
      "sizeBytes": 377277,
      "kind": "pdf"
    },
    "49dac3ada2426928bf84e77d5ea9a38304df85ae5d56083b628d29888ec6b91e": {
      "sha256": "49dac3ada2426928bf84e77d5ea9a38304df85ae5d56083b628d29888ec6b91e",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S1540748918302682-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:08.659Z",
      "sizeBytes": 4692255,
      "kind": "pdf"
    },
    "bd69f63d56b892fafa344483fe44a502e1a531c5cb4b91292f9667e3d80926fc": {
      "sha256": "bd69f63d56b892fafa344483fe44a502e1a531c5cb4b91292f9667e3d80926fc",
      "firstSeenBatch": "B-20261112-006",
      "firstSeenName": "1-s2.0-S1540748918303778-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:09.703Z",
      "sizeBytes": 928776,
      "kind": "pdf"
    },
    "e712a5d3042e72b80f85f0d1aed012a5bd01233a64e470b361fc43ef6c67cc7e": {
      "sha256": "e712a5d3042e72b80f85f0d1aed012a5bd01233a64e470b361fc43ef6c67cc7e",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748918303845-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:54.576Z",
      "sizeBytes": 6072443,
      "kind": "pdf"
    },
    "aee0cc4df03bdc6bc7ba8159b163bcec5292f879c8ddddd242f310342f19c39f": {
      "sha256": "aee0cc4df03bdc6bc7ba8159b163bcec5292f879c8ddddd242f310342f19c39f",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748918305145-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:55.495Z",
      "sizeBytes": 278951,
      "kind": "pdf"
    },
    "dafeb5e1fd8b05c41cbf21ff2f1d88979207312d81a4920dafe1e76312e0412f": {
      "sha256": "dafeb5e1fd8b05c41cbf21ff2f1d88979207312d81a4920dafe1e76312e0412f",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748920300602-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:56.556Z",
      "sizeBytes": 319108,
      "kind": "pdf"
    },
    "c7d536a99fe69c30bbc532aa098cc8b4e9e104920181254440ea747ffcc03a32": {
      "sha256": "c7d536a99fe69c30bbc532aa098cc8b4e9e104920181254440ea747ffcc03a32",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748920301711-am.pdf",
      "firstSeenAt": "2026-11-12T21:00:59.219Z",
      "sizeBytes": 1178409,
      "kind": "pdf"
    },
    "a1074f810b34f7420123ff6f1939c6eb58f0c70e9830183e3d5334b67fd73fdc": {
      "sha256": "a1074f810b34f7420123ff6f1939c6eb58f0c70e9830183e3d5334b67fd73fdc",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748922000670-am.pdf",
      "firstSeenAt": "2026-11-12T21:01:01.298Z",
      "sizeBytes": 815648,
      "kind": "pdf"
    },
    "787c87862b4a73993330812b6ac0f08aaeb1336a4f450883cd4f5afb6bc0ba17": {
      "sha256": "787c87862b4a73993330812b6ac0f08aaeb1336a4f450883cd4f5afb6bc0ba17",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748922000736-am.pdf",
      "firstSeenAt": "2026-11-12T21:01:02.997Z",
      "sizeBytes": 567842,
      "kind": "pdf"
    },
    "c7fe9181275176e98d45750ee9ebcc6ac854989eb5c6cfe06eafe541668e98c1": {
      "sha256": "c7fe9181275176e98d45750ee9ebcc6ac854989eb5c6cfe06eafe541668e98c1",
      "firstSeenBatch": "B-20261112-007",
      "firstSeenName": "1-s2.0-S1540748922004497-am.pdf",
      "firstSeenAt": "2026-11-12T21:01:04.488Z",
      "sizeBytes": 711109,
      "kind": "pdf"
    },
    "c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a": {
      "sha256": "c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a",
      "firstSeenBatch": "B-20261113-001",
      "firstSeenName": "PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
      "firstSeenAt": "2026-11-13T15:13:17.043Z",
      "sizeBytes": 7111,
      "kind": "csv"
    },
    "9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7": {
      "sha256": "9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7",
      "firstSeenBatch": "B-20261113-001",
      "firstSeenName": "PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv",
      "firstSeenAt": "2026-11-13T15:13:17.104Z",
      "sizeBytes": 6601,
      "kind": "csv"
    },
    "d35934fede1835e4ef4d3e487edbf0f554ee527d0591191d19fc2bbab18dafdd": {
      "sha256": "d35934fede1835e4ef4d3e487edbf0f554ee527d0591191d19fc2bbab18dafdd",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-10_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.567Z",
      "sizeBytes": 3069,
      "kind": "txt"
    },
    "c62fbfb1e55bbc9534994d30680c4e472ecfdd0101b5a4b96c9dd7af786edf02": {
      "sha256": "c62fbfb1e55bbc9534994d30680c4e472ecfdd0101b5a4b96c9dd7af786edf02",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-20_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.810Z",
      "sizeBytes": 6223,
      "kind": "txt"
    },
    "0fb2f4269e5c4316a90044f76e44fb911ca29495d9567b0b3492c9869c2c0255": {
      "sha256": "0fb2f4269e5c4316a90044f76e44fb911ca29495d9567b0b3492c9869c2c0255",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-21_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.862Z",
      "sizeBytes": 5553,
      "kind": "txt"
    },
    "e63054fcf6eafe0ba457adac96e5a131c30591f8c070c7a33631d5eef64b2a42": {
      "sha256": "e63054fcf6eafe0ba457adac96e5a131c30591f8c070c7a33631d5eef64b2a42",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-22_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.895Z",
      "sizeBytes": 4685,
      "kind": "txt"
    },
    "de0a597b0801ce9f1d7f01795531e7ba3b6bf88e9336873f75f464d296818dba": {
      "sha256": "de0a597b0801ce9f1d7f01795531e7ba3b6bf88e9336873f75f464d296818dba",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-23_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.943Z",
      "sizeBytes": 5206,
      "kind": "txt"
    },
    "6b8370495c85a6b6c0a00b7c0980b02d22242a1d0904d7716571fc083e8718ad": {
      "sha256": "6b8370495c85a6b6c0a00b7c0980b02d22242a1d0904d7716571fc083e8718ad",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-25_record.txt",
      "firstSeenAt": "2026-11-13T15:15:15.987Z",
      "sizeBytes": 3836,
      "kind": "txt"
    },
    "e7dfda685d19414cd1ba115792c20cd74dec63e7ee3dad6ff917251b27b507ac": {
      "sha256": "e7dfda685d19414cd1ba115792c20cd74dec63e7ee3dad6ff917251b27b507ac",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-26_record.txt",
      "firstSeenAt": "2026-11-13T15:15:16.138Z",
      "sizeBytes": 4442,
      "kind": "txt"
    },
    "fad8926a2e0996b86addc4432bbc48a707c4da71a50bc717011db12d2cd3ff5d": {
      "sha256": "fad8926a2e0996b86addc4432bbc48a707c4da71a50bc717011db12d2cd3ff5d",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-39_record.txt",
      "firstSeenAt": "2026-11-13T15:15:16.289Z",
      "sizeBytes": 4084,
      "kind": "txt"
    },
    "eb7488eaddafabaebaa9106d76a083a934f9b15bc19969fce1d1a3a68d471c05": {
      "sha256": "eb7488eaddafabaebaa9106d76a083a934f9b15bc19969fce1d1a3a68d471c05",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-47_record.txt",
      "firstSeenAt": "2026-11-13T15:15:16.327Z",
      "sizeBytes": 4076,
      "kind": "txt"
    },
    "1b562f16f85f306afde1daf5b3ed87dcf6d42281d9925ec7b0a88dff4b4fe80e": {
      "sha256": "1b562f16f85f306afde1daf5b3ed87dcf6d42281d9925ec7b0a88dff4b4fe80e",
      "firstSeenBatch": "B-20261113-003",
      "firstSeenName": "PSI-68_record.txt",
      "firstSeenAt": "2026-11-13T15:15:16.402Z",
      "sizeBytes": 6680,
      "kind": "txt"
    },
    "8bd211c886db1cdc45ae8414946ab4513cda9456706db90b30bbe2c8992d33e4": {
      "sha256": "8bd211c886db1cdc45ae8414946ab4513cda9456706db90b30bbe2c8992d33e4",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-69_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.101Z",
      "sizeBytes": 6391,
      "kind": "txt"
    },
    "4000a663ba84c409698d8cb5a6949024ee7b951bd315a2e5080005d5eb9df268": {
      "sha256": "4000a663ba84c409698d8cb5a6949024ee7b951bd315a2e5080005d5eb9df268",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-98_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.218Z",
      "sizeBytes": 3935,
      "kind": "txt"
    },
    "14aa17693cc496694a66453deb18c7f086f384923fe89a8fa2d625d322c5535d": {
      "sha256": "14aa17693cc496694a66453deb18c7f086f384923fe89a8fa2d625d322c5535d",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-99_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.371Z",
      "sizeBytes": 3942,
      "kind": "txt"
    },
    "825c4c4835be5275c9ecc97199b8a657cc5e0558c58dd49822bbb22883b3d9bc": {
      "sha256": "825c4c4835be5275c9ecc97199b8a657cc5e0558c58dd49822bbb22883b3d9bc",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-100_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.436Z",
      "sizeBytes": 3586,
      "kind": "txt"
    },
    "0f1d5369b9c03409fc9d9a0132e5ecfb175fd9c6fc26fa80d7590bf42b453c62": {
      "sha256": "0f1d5369b9c03409fc9d9a0132e5ecfb175fd9c6fc26fa80d7590bf42b453c62",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-101_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.474Z",
      "sizeBytes": 4774,
      "kind": "txt"
    },
    "612926b9247fc45ac65b7af840dcc253c887f1c611de2aff911db907d9706d36": {
      "sha256": "612926b9247fc45ac65b7af840dcc253c887f1c611de2aff911db907d9706d36",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-102_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.524Z",
      "sizeBytes": 4231,
      "kind": "txt"
    },
    "f6b6b35fbd6face9395dd5bcde343cc5fee3fa811a553cc7b88656e367d76e6f": {
      "sha256": "f6b6b35fbd6face9395dd5bcde343cc5fee3fa811a553cc7b88656e367d76e6f",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-106_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.554Z",
      "sizeBytes": 2657,
      "kind": "txt"
    },
    "68fcc667f543ddf557ea423a5a760aa33defba82298ad76b4f86009294229d92": {
      "sha256": "68fcc667f543ddf557ea423a5a760aa33defba82298ad76b4f86009294229d92",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-107_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.623Z",
      "sizeBytes": 2926,
      "kind": "txt"
    },
    "c84640d2e7d889a08240e1eae51a3b28e95ec2c61325b04c1771ce1b5f48c9b7": {
      "sha256": "c84640d2e7d889a08240e1eae51a3b28e95ec2c61325b04c1771ce1b5f48c9b7",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-108_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.668Z",
      "sizeBytes": 8374,
      "kind": "txt"
    },
    "94e2fb92879242fa9b82766fa8f9406482376a15fbfa83f6ac151d1d3c3df484": {
      "sha256": "94e2fb92879242fa9b82766fa8f9406482376a15fbfa83f6ac151d1d3c3df484",
      "firstSeenBatch": "B-20261113-004",
      "firstSeenName": "PSI-115_record.txt",
      "firstSeenAt": "2026-11-13T15:15:45.725Z",
      "sizeBytes": 3138,
      "kind": "txt"
    },
    "81f76211d55748d7fffd49622f3c4ac842d710a2e94dedaf834f6583605cce62": {
      "sha256": "81f76211d55748d7fffd49622f3c4ac842d710a2e94dedaf834f6583605cce62",
      "firstSeenBatch": "B-20261113-005",
      "firstSeenName": "PSI-117_record.txt",
      "firstSeenAt": "2026-11-13T15:15:47.048Z",
      "sizeBytes": 3581,
      "kind": "txt"
    },
    "f046d1d8b1458b183447b6af24802c670286dc402916e2c62af96c560293b0fa": {
      "sha256": "f046d1d8b1458b183447b6af24802c670286dc402916e2c62af96c560293b0fa",
      "firstSeenBatch": "B-20261113-005",
      "firstSeenName": "PSI-142_record.txt",
      "firstSeenAt": "2026-11-13T15:15:47.093Z",
      "sizeBytes": 4772,
      "kind": "txt"
    },
    "e911b6ec6e91ca7ed516f35a876380a7237817b0ed64fda1a800078ab369c6b6": {
      "sha256": "e911b6ec6e91ca7ed516f35a876380a7237817b0ed64fda1a800078ab369c6b6",
      "firstSeenBatch": "B-20261113-005",
      "firstSeenName": "PSI-159_record.txt",
      "firstSeenAt": "2026-11-13T15:15:47.131Z",
      "sizeBytes": 3490,
      "kind": "txt"
    },
    "09ddff51a83747129024e84980b4f74a867f6cbeeaab39bd8fda6309f6b289d7": {
      "sha256": "09ddff51a83747129024e84980b4f74a867f6cbeeaab39bd8fda6309f6b289d7",
      "firstSeenBatch": "B-20261113-005",
      "firstSeenName": "PSI-60_record.txt",
      "firstSeenAt": "2026-11-13T15:15:47.202Z",
      "sizeBytes": 3095,
      "kind": "txt"
    },
    "65dcc7322daac517aae5135a465132881064fbe5efc77d9d47a7bd79edc20a24": {
      "sha256": "65dcc7322daac517aae5135a465132881064fbe5efc77d9d47a7bd79edc20a24",
      "firstSeenBatch": "B-20261113-005",
      "firstSeenName": "PSI-62_record.txt",
      "firstSeenAt": "2026-11-13T15:15:47.233Z",
      "sizeBytes": 4397,
      "kind": "txt"
    }
  }
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/nasa_media_index.json', '{
 "fetched_at": "2026-11-11T19:38:17Z",
 "source": "NASA Images and Video Library API (images-api.nasa.gov)",
 "rights": "NASA media usage guidelines; content generally not copyrighted (public domain); credit NASA",
 "items": [
  {
   "nasa_id": "GRC-2016-C-05051",
   "title": "Advanced Combustion via Microgravity Experiments, ACME chamber insert",
   "description": "NASA Glenn engineer Christopher Mroczka inspects the gas-jet burner within the Advanced Combustion via Microgravity Experiments, ACME insert for the Combustion Integrated Rack, CIR. The apparatus allows researchers to conduct experiments with flames of gaseous fuels on the International Space Station, ISS",
   "center": "GRC",
   "date_created": "2016-06-22T00:00:00Z",
   "keywords": [
    "combustion",
    "microgravity",
    "experiment",
    "space",
    "research",
    "flame",
    "chamber",
    "Christopher Mroczka",
    "ACME",
    "Advanced Combustion via Microgravity Experiments",
    "Space Experiments",
    "Gaseous Fuels"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2016-C-05051/GRC-2016-C-05051~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2016-C-05051/GRC-2016-C-05051~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2018-C-09928",
   "title": "High Pressure Microgravity Combustion, HPMC",
   "description": "High Pressure Microgravity Combustion Experiment, HPMC,  subjects liquid fuel droplets to high pressures and temperatures to study the ignition process in engine conditions, with a goal of improving fuel efficiency. In this configuration, the experiment is capable of testing droplet combustion at up to 100 atm of pressure, testing the droplet deployment system, which inserts the fuel droplet into the experiment.",
   "center": "GRC",
   "date_created": "2018-11-29T00:00:00Z",
   "keywords": [
    "High Pressure Microgravity Combustion",
    "HPMC",
    "Welch_503015",
    "Evan Rose",
    "Zero-G",
    "0-G",
    "Zero Gravity",
    "Space Experiment",
    "Space Experiments",
    "2018 Highlight"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2018-C-09928/GRC-2018-C-09928~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2018-C-09928/GRC-2018-C-09928~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss056e130654",
   "title": "Advanced Combustion via Microgravity Experiments (ACME)",
   "description": "iss056e130654 (Aug. 10, 2018) --- The Combustion Integration Rack (CIR), pictured in its open configuration, is located in the U.S. Destiny laboratory module and includes an optics bench, combustion chamber, fuel and oxidizer control, and five different cameras for performing combustion experiments safely in microgravity.",
   "center": "JSC",
   "date_created": "2018-08-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss056e130654/iss056e130654~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss056e130654/iss056e130654~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2013-C-03367",
   "title": "GRC-2013-C-03367",
   "description": "Mechanical Engineer Adrian Drake inspects engineering model hardware built to generate a high-voltage electric field for the Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames) experiment of the Advanced Combustion via Microgravity Experiments (ACME) project. ACME\u2019s small computer (i.e., the Cube) for data acquisition and control within the CIR combustion chamber is seen in the right foreground.  The E-FIELD Flames tests were conducted in the Combustion Integrated Rack (CIR) on the International Space Station (ISS) in 2018.",
   "center": "GRC",
   "date_created": "2013-08-19T00:00:00Z",
   "keywords": [
    "microgravity, Technologies, Model,Engineering, Combustion,Advanced, Experiments, Engineering Model, Zin Technologies, Adrian, D3X_1341.tif, SubAssembly, Mills_500781, Adrian Drake, Advanced Combustion via Microgravity Experiments, Drake, ACME, ACME EM C"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2013-C-03367/GRC-2013-C-03367~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2013-C-03367/GRC-2013-C-03367~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2019-C-00468",
   "title": "High Pressure Microgravity Combustion (HPMC) Facility, Drople...",
   "description": "High Pressure Microgravity Combustion Experiment, HPMC,  subjects liquid fuel droplets to high pressures and temperatures to study the ignition process in engine conditions, with a goal of improving fuel efficiency. In this configuration, the experiment is capable of testing droplet combustion at up to 100 atm of pressure, testing the droplet deployment system, which inserts the fuel droplet into the experiment.",
   "center": "GRC",
   "date_created": "2019-03-13T00:00:00Z",
   "keywords": [
    "Hicks_503050",
    "Eric Neumann",
    "2019 Highlight"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2019-C-00468/GRC-2019-C-00468~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2019-C-00468/GRC-2019-C-00468~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2020-C-00116",
   "title": "Review of International Space Station, ISS data from the Structure and Response of Spherical Diffusion Flames, s-Flame experiment in the Telescience Support Center, TSC, also known as the Glenn ISS Payload Operations Center, GIPOC",
   "description": "Review of ISS data from the Structure and Response of Spherical Diffusion Flames (s-Flame) experiment - of the Advanced Combustion via Microgravity Experiments. ACME project conducted in the Combustion Integrated Rack, CIR - by ACME Project Scientist Dennis Stocker in the Telescience Support Center,TSC, also known as the Glenn ISS Payload Operations Center, GIPOC",
   "center": "GRC",
   "date_created": "2020-01-14T00:00:00Z",
   "keywords": [
    "ISS",
    "TSC",
    "Sicker_503177",
    "Dennis Stocker",
    "Combustion Integrated Rack",
    "CIR",
    "Advanced Combustion via Microgravity Experiments",
    "ACME",
    "s-Flame",
    "Structure and Response of Spherical Diffusion Flames",
    "Telescience Support Center",
    "Glenn ISS Payload Operations Center"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2020-C-00116/GRC-2020-C-00116~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2020-C-00116/GRC-2020-C-00116~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2020-C-00115",
   "title": "Testing of software with ground hardware for the Structue and Response of Spherical Diffusion Flames, s-Flame, experiment in the Telescience Support Center, TSC, also known as the Glenn ISS Payload Operations Center, GIPOC",
   "description": "Testing of software with ground hardware for the Structue and Response of Spherical Diffusion Flames, s-Flame, experiment  - of the Advanced Combustion via Microgravity Experiments, ACME, project conducted in the ISS Combustion Integrated Rack, CIR - by ACME Software Engineer Jeffrey Eggers, Operations Lead Angela Adams, and Planning Lead Melani Smajdek in the Telescience Support Center, TSC, also known as the Glenn ISS Payload Operations Center, GIPOC",
   "center": "GRC",
   "date_created": "2020-01-14T00:00:00Z",
   "keywords": [
    "Combustion Integrated Rack",
    "CIR",
    "Advanced Combustion via Microgravity Experiments",
    "ACME",
    "Structure and Response of Spherical Diffusion Flames",
    "s-Flame",
    "ISS",
    "International Space Station",
    "Telescience Support Center",
    "TSC",
    "Glenn ISS Payload Operations Center",
    "GIPOC"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2020-C-00115/GRC-2020-C-00115~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2020-C-00115/GRC-2020-C-00115~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss058e026380",
   "title": "Astronaut David Saint-Jacques works on the Combustion Integrated Rack",
   "description": "iss058e026380 (Feb. 26, 2019) --- Astronaut David Saint-Jacques of the Canadian Space Agency is inside the U.S. Destiny laboratory module working on the Combustion Integrated Rack. Saint-Jacques replaced fuel flow controllers inside the device for the Advanced Combustion via Microgravity Experiments which are a set of five independent studies of gaseous flames.",
   "center": "JSC",
   "date_created": "2019-02-26T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss058e026380/iss058e026380~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss058e026380/iss058e026380~medium.jpg",
   "api_query": "microgravity combustion",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2005-C-00892",
   "title": "Combustion Integration Rack (CIR) Testing",
   "description": "Fluids and Combustion Facility (FCF), Combustion Integration Rack (CIR) during testing in the Structural Dynamics Laboratory (SDL). The Fluids and Combustion Facility (FCF) is a set of two International Space Station (ISS) research facilities designed to support physical and biological experiments in support of technology development and validation in space. The FCF consists of two modular, reconfigurable racks called the Combustion Integration Rack (CIR) and the Fluids Integration Rack (FIR). The CIR and FIR were developed at NASA\u02bcs Glenn Research Center.",
   "center": "GRC",
   "date_created": "2015-02-18T00:00:00Z",
   "keywords": [
    "CIR",
    "FCF",
    "microgravity",
    "space",
    "research",
    "ISS",
    "combustion",
    "fluids"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2005-C-00892/GRC-2005-C-00892~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2005-C-00892/GRC-2005-C-00892~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2006-C-00540",
   "title": "GRC-2006-C-00540",
   "description": "Combustion Integrated Rack (CIR)",
   "center": "GRC",
   "date_created": "2006-01-31T00:00:00Z",
   "keywords": [
    "2006",
    "OMalley_407602",
    "G6QN5034.tif",
    "333",
    "Bldg.",
    "Bldg. 333",
    "CIR",
    "Combustion",
    "Combustion Integrated Rack",
    "Configuration",
    "Flight",
    "Flight Configuration"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2006-C-00540/GRC-2006-C-00540~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2006-C-00540/GRC-2006-C-00540~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2006-C-00542",
   "title": "GRC-2006-C-00542",
   "description": "Combustion Integrated Rack (CIR)",
   "center": "GRC",
   "date_created": "2006-01-31T00:00:00Z",
   "keywords": [
    "2006",
    "OMalley_407602",
    "G6QN5037.tif",
    "333",
    "Bldg.",
    "Bldg. 333",
    "CIR",
    "Combustion",
    "Combustion Integrated Rack",
    "Configuration",
    "Flight",
    "Flight Configuration"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2006-C-00542/GRC-2006-C-00542~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2006-C-00542/GRC-2006-C-00542~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2006-C-00541",
   "title": "GRC-2006-C-00541",
   "description": "Combustion Integrated Rack (CIR)",
   "center": "GRC",
   "date_created": "2006-01-31T00:00:00Z",
   "keywords": [
    "2006",
    "OMalley_407602",
    "G6QN5034.tif",
    "333",
    "Bldg.",
    "Bldg. 333",
    "CIR",
    "Combustion",
    "Combustion Integrated Rack",
    "Configuration",
    "Flight",
    "Flight Configuration"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2006-C-00541/GRC-2006-C-00541~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2006-C-00541/GRC-2006-C-00541~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "GRC-2006-C-00543",
   "title": "GRC-2006-C-00543",
   "description": "Combustion Integrated Rack (CIR)",
   "center": "GRC",
   "date_created": "2006-01-31T00:00:00Z",
   "keywords": [
    "2006",
    "OMalley_407602",
    "G6QN5039.tif",
    "333",
    "Bldg.",
    "Bldg. 333",
    "CIR",
    "Combustion",
    "Combustion Integrated Rack",
    "Configuration",
    "Flight",
    "Flight Configuration"
   ],
   "thumb": "https://images-assets.nasa.gov/image/GRC-2006-C-00543/GRC-2006-C-00543~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/GRC-2006-C-00543/GRC-2006-C-00543~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss032e014574",
   "title": "Combustion Integrated Rack IFM",
   "description": "ISS032-E-014574 (7 Aug. 2012) --- NASA astronaut Joe Acaba, Expedition 32 flight engineer, works on the Combustion Integrated Rack (CIR) in the Destiny laboratory of the International Space Station.",
   "center": "JSC",
   "date_created": "2012-08-07T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss032e014574/iss032e014574~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss032e014574/iss032e014574~medium.jpg",
   "api_query": "Combustion Integrated Rack",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss043e190395",
   "title": "CIR MDCA replacement",
   "description": "ISS043E190395 (05/13/2015) --- NASA astronaut Terry Virts prepares the Multi-user Droplet Combustion Apparatus from inside the Combustion Integrated Rack for upcoming runs of the FLame Extinguishment Experiment, or FLEX-2. The FLEX-2 experiment studies how quickly fuel burns, the conditions required for soot to form, and how mixtures of fuels evaporate before burning. Understanding these processes could lead to the production of a safer spacecraft as well as increased fuel efficiency for engines using liquid fuel on Earth.",
   "center": "JSC",
   "date_created": "2015-05-13T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss043e190395/iss043e190395~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss043e190395/iss043e190395~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss035e017702",
   "title": "Cassidy conducts MDCA Fuel Reservoir Remove and Replace OPS",
   "description": "ISS035-E-017699 (10 April 2013) --- This is one of several photos documenting the  Multi-user Droplet Combustion Apparatus (MDCA) Fuel Reservoir replacement.  Here, Expedition 35 Flight Engineer Chris Cassidy removes and replaces one of the Fuel Reservoirs with the MDCA Chamber Insert Assembly (CIA) pulled partially out of the Combustion Chamber. The MDCA Fuel Reservoirs contain the liquid fuel used during droplet combustion experiments.   This reservoir change-out was in support of the FLame EXtinguishment (FLEX)-2 experiment, scheduled to be executed by ground controllers.",
   "center": "JSC",
   "date_created": "2013-04-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss035e017702/iss035e017702~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss035e017702/iss035e017702~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss035e017712",
   "title": "Cassidy conducts MDCA Fuel Reservoir Remove and Replace OPS",
   "description": "ISS035-E-017712 (10 April 2013)?-- This is one of several photos documenting the  Multi-user Droplet Combustion Apparatus (MDCA) Fuel Reservoir replacement in the U.S. lab Destiny.  Here, Expedition 35 Flight Engineer Chris Cassidy removes and replaces one of the Fuel Reservoirs with the MDCA Chamber Insert Assembly (CIA) pulled partially out of the Combustion Chamber. The MDCA Fuel Reservoirs contain the liquid fuel used during droplet combustion experiments.   This reservoir change-out was in support of the FLame EXtinguishment (FLEX)-2 experiment, scheduled to be executed by ground controll",
   "center": "JSC",
   "date_created": "2013-04-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss035e017712/iss035e017712~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss035e017712/iss035e017712~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss035e017705",
   "title": "Cassidy conducts MDCA Fuel Reservoir Remove and Replace OPS",
   "description": "ISS035-E-017699 (10 April 2013) --- This is one of several photos documenting the  Multi-user Droplet Combustion Apparatus (MDCA) Fuel Reservoir replacement.  Here, Expedition 35 Flight Engineer Chris Cassidy removes and replaces one of the Fuel Reservoirs with the MDCA Chamber Insert Assembly (CIA) pulled partially out of the Combustion Chamber. The MDCA Fuel Reservoirs contain the liquid fuel used during droplet combustion experiments.   This reservoir change-out was in support of the FLame EXtinguishment (FLEX)-2 experiment, scheduled to be executed by ground controllers.",
   "center": "JSC",
   "date_created": "2013-04-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss035e017705/iss035e017705~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss035e017705/iss035e017705~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss035e017700",
   "title": "Cassidy conducts MDCA Fuel Reservoir Remove and Replace OPS",
   "description": "ISS035-E-017699 (10 April 2013) --- This is one of several photos documenting the  Multi-user Droplet Combustion Apparatus (MDCA) Fuel Reservoir replacement.  Here, Expedition 35 Flight Engineer Chris Cassidy removes and replaces one of the Fuel Reservoirs with the MDCA Chamber Insert Assembly (CIA) pulled partially out of the Combustion Chamber. The MDCA Fuel Reservoirs contain the liquid fuel used during droplet combustion experiments.   This reservoir change-out was in support of the FLame EXtinguishment (FLEX)-2 experiment, scheduled to be executed by ground controllers.",
   "center": "JSC",
   "date_created": "2013-04-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss035e017700/iss035e017700~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss035e017700/iss035e017700~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss035e017703",
   "title": "Cassidy conducts MDCA Fuel Reservoir Remove and Replace OPS",
   "description": "ISS035-E-017699 (10 April 2013) --- This is one of several photos documenting the  Multi-user Droplet Combustion Apparatus (MDCA) Fuel Reservoir replacement.  Here, Expedition 35 Flight Engineer Chris Cassidy removes and replaces one of the Fuel Reservoirs with the MDCA Chamber Insert Assembly (CIA) pulled partially out of the Combustion Chamber. The MDCA Fuel Reservoirs contain the liquid fuel used during droplet combustion experiments.   This reservoir change-out was in support of the FLame EXtinguishment (FLEX)-2 experiment, scheduled to be executed by ground controllers.",
   "center": "JSC",
   "date_created": "2013-04-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss035e017703/iss035e017703~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss035e017703/iss035e017703~medium.jpg",
   "api_query": "FLEX flame extinguishment experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "jsc2023e046377",
   "title": "jsc2023e046377",
   "description": "jsc2023e046377 (12/14/2019) --- A view of the Spacecraft Fire Safety Experiments (Saffire) VI experiment hardware, loaded inside the Northrop Grumman (NG) Cygnus cargo vehicle for the 19th NG resupply mission to the International Space Station. Saffire is a series of experiments to investigate how fire spreads on a variety of combustible materials in the microgravity environment. The experiments are ignited in the Cygnus cargo spacecraft after it departs the space station and before it reenters the Earth''s atmosphere. Saffire-VI builds on prior results to test flammability at different oxygen ",
   "center": "JSC",
   "date_created": "2019-12-14T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/jsc2023e046377/jsc2023e046377~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/jsc2023e046377/jsc2023e046377~medium.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "jsc2023e046631",
   "title": "jsc2023e046631",
   "description": "jsc2023e046631 (7/25/2023) --- Plexiglass is shown burning in Spacecraft Fire Experiment-IV (Saffire-IV). The flame appears orange because of the soot that is produced as it burns. As the plexiglass burns, the solid is melted, vaporized, and then the vapor burns. The bright flame balls in the flame is vapor burning as it is expelled from the surface. Saffire-VI burns plexiglass at higher oxygen concentrations. The Saffire experiments aim to inform the development of fire safety equipment and strategies for future spacecraft.",
   "center": "JSC",
   "date_created": "2023-07-25T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/jsc2023e046631/jsc2023e046631~small.jpg",
   "full": "https://images-assets.nasa.gov/image/jsc2023e046631/jsc2023e046631~small.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "jsc2020e043815",
   "title": "Cargo PORT Outer Bay 4 L912 (S/N 1002)",
   "description": "jsc2020e043815 (Sept. 10, 2020) --- A view of the Spacecraft Fire Safety Experiments (Saffire) V experiment hardware, loaded inside the Northrop Grumman(NG) Cygnus cargo vehicle for the 14th NG resupply mission to the International Space Station. Saffire is a series of experiments to investigate how fire spreads on a variety of combustible materials in the microgravity environment. The experiments are ignited in Cygnus cargo spacecraft after it departs the space station and before it reenters the Earth''s atmosphere. Studying the development and growth of fire in a re-supply cargo vehicle elimi",
   "center": "JSC",
   "date_created": "2020-09-10T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/jsc2020e043815/jsc2020e043815~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/jsc2020e043815/jsc2020e043815~medium.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "jsc2023e046375",
   "title": "jsc2023e046375",
   "description": "jsc2023e046375 (7/25/2023) --- A sample of fabric burns inside Spacecraft Fire Experiment-IV (Saffire-IV). The sample is a composite fabric made of cotton and fiberglass and is 40 cm wide. The image appears green because green LED lights are used to illuminate the sample during a burn. The flame appears orange in this image and the black region to the right of the flame is the cotton in the sample beginning to heat and char. The bright specks to the left of the flame are smoldering cotton that remains on the fiberglass substrate after the flame passes. In Saffire-VI, this fabric is burned at h",
   "center": "JSC",
   "date_created": "2023-07-25T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/jsc2023e046375/jsc2023e046375~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/jsc2023e046375/jsc2023e046375~medium.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "jsc2023e046376",
   "title": "jsc2023e046376",
   "description": "jsc2023e046376 (12/12/2019) --- The Far-Field Diagnostic (FFD) hardware for Spacecraft Fire Experiment-VI (Saffire-VI) is pictured aboard Cygnus before launch. This package contains the Smoke Eater and CO scrubbers, a prototype Combustion Product Monitor to be used on Orion, particulate sensors, and sensors for CO, CO2, and oxygen gases. The containers for the FFD were fabricated by HUNCH (High school students United with NASA to Create Hardware). Their signatures are shown on the side of the FFD. The Saffire series helps researchers to understand realistic fire spread scenarios on spacecraft ",
   "center": "JSC",
   "date_created": "2019-12-12T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/jsc2023e046376/jsc2023e046376~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/jsc2023e046376/jsc2023e046376~medium.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss051e039882",
   "title": "Saffire-II in Cygnus OA-7 during Cargo Transfer OPS",
   "description": "iss051e039882 (5/8/2017) --- A view of Spacecraft Fire Experiment-III (Saffire-III) award the John Glenn Orbital ATK 7 (OA-7) Cygnus spacecraft, taken during cargo transfer operations (OPS). The NASA Advanced Exploration Systems program began a project to develop and demonstrate spacecraft fire safety technologies in relevant environments. The keystone of these demonstrations is a large-scale fire safety experiment conducted on an International Space Station (ISS) re-supply vehicle after it has undocked from the ISS and before it enters the atmosphere.",
   "center": "JSC",
   "date_created": "2017-05-08T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss051e039882/iss051e039882~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss051e039882/iss051e039882~medium.jpg",
   "api_query": "SAFFIRE spacecraft fire experiment",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss064e040953",
   "title": "iss064e040953",
   "description": "iss064e040953 (March 9, 2021) --- NASA astronaut and Expedition 64 Flight Engineer Kate Rubins replaces and cleans hardware supporting a suite of studies known as ACME, or Advanced Combustion via Microgravity Experiments, located in the Combustion Integrated Rack. Rubins performs the work on ACME''s chamber insert in the Unity module''s Maintenance Work Area.",
   "center": "JSC",
   "date_created": "2021-03-09T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss064e040953/iss064e040953~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss064e040953/iss064e040953~medium.jpg",
   "api_query": "ACME advanced combustion microgravity experiments",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss058e008801",
   "title": "Astronaut David Saint-Jacques of the Canadian Space Agency",
   "description": "iss058e008801 (Jan. 31, 2019) --- Astronaut David Saint-Jacques of the Canadian Space Agency replaces a control unit and a radiometer inside the Combustion Integrated Rack''s (CIR) ACME (Advanced Combustion via Microgravity Experiments) Chamber Insert. The replacement work in the chamber was done on the Unity module''s work surface area. The CIR is a fuel and flame research rack housed inside the Destiny laboratory module.",
   "center": "JSC",
   "date_created": "2019-01-30T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss058e008801/iss058e008801~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss058e008801/iss058e008801~medium.jpg",
   "api_query": "ACME advanced combustion microgravity experiments",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "0003794",
   "title": "Microgravity",
   "description": "Students from Albuquerque, MN, tour through the mockup of the U.S. Destiny laboratory module that will be attached to the International Space Station (ISS). Behind them are the racks for the Fluids and Combustion Facility being developed by Glenn Research Center. The mockup was on display at the Space Tehnology International Forum in Albuquerque, MN. Photo credit: NASA/Marshall Space Flight Center ",
   "center": "MSFC",
   "date_created": "2000-01-31T00:00:00Z",
   "keywords": [
    "Destiny",
    "Laboratory",
    "International Space Station"
   ],
   "thumb": "https://images-assets.nasa.gov/image/0003794/0003794~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/0003794/0003794~medium.jpg",
   "api_query": "International Space Station Destiny laboratory",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "9705912",
   "title": "International Space Station (ISS)",
   "description": "This Boeing photograph shows the Node 1, Unity module, Flight Article (at right) and the U.S. Laboratory module, Destiny, Flight Article for the International Space Station (ISS) being manufactured in the High Bay Clean Room of the Space Station Manufacturing Facility at the Marshall Space Flight Center. The Node 1, or Unity, serves as a cornecting passageway to Space Station modules. The U.S. built Unity module was launched aboard the orbiter Endeavour (STS-88 mission) on December 4, 1998 and connected to the Zarya, the Russian-built Functional Energy Block (FGB). The U.S. Laboratory (Destiny",
   "center": "MSFC",
   "date_created": "1997-06-01T00:00:00Z",
   "keywords": [
    "International Space Station",
    "ISS",
    "Node 1",
    "Unity",
    "U.S. Laboratory",
    "Destiny"
   ],
   "thumb": "https://images-assets.nasa.gov/image/9705912/9705912~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/9705912/9705912~medium.jpg",
   "api_query": "International Space Station Destiny laboratory",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "0003786",
   "title": "Microgravity",
   "description": "Engineers from NASA''s Glen Research Center demonstrate the access to one of the experiment racks plarned for the U.S. Destiny laboratory module on the International Space Station (ISS). This mockup has the full diameter, full corridor width, and half the length of the module. The mockup includes engineering mockups of the Fluids and Combustion Facility being developed by NASA''s Glenn Research Center. (The full module will be six racks long; the mockup is three racks long). Photo credit: NASA/Marshall Space Flight Center (MSFC)",
   "center": "MSFC",
   "date_created": "2000-01-30T00:00:00Z",
   "keywords": [
    "Destiny laboratory",
    "International Space Station",
    "mockup"
   ],
   "thumb": "https://images-assets.nasa.gov/image/0003786/0003786~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/0003786/0003786~medium.jpg",
   "api_query": "International Space Station Destiny laboratory",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "0102498",
   "title": "International Space Station (ISS)",
   "description": "The International Space Station (ISS), with its newly attached U.S. Laboratory, Destiny, was photographed by a crew member aboard the Space Shuttle Orbiter Atlantis during a fly-around inspection after Atlantis separated from the Space Station. The Laboratory is shown in the foreground of this photograph. The American-made Destiny module is the cornerstone for space-based research aboard the orbiting platform and the centerpiece of the International Space Station (ISS), where unprecedented science experiments will be performed in the near-zero gravity of space. Destiny will also serve as the c",
   "center": "MSFC",
   "date_created": "2001-02-16T00:00:00Z",
   "keywords": [
    "STS-98",
    "U.S. Laboratory",
    "Destiny",
    "International Space Station",
    "ISS"
   ],
   "thumb": "https://images-assets.nasa.gov/image/0102498/0102498~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/0102498/0102498~medium.jpg",
   "api_query": "International Space Station Destiny laboratory",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "0003787",
   "title": "Microgravity",
   "description": "Engineers from NASA''s Glenn Research Center demonstrate the access to one of the experiment racks planned for the U.S. Destiny laboratory module on the International Space Station (ISS). This mockup has the full diameter, full corridor width, and half the length of the module. The mockup includes engineering mockups of the Fluids and Combustion Facility being developed by NASA''s Glenn Research Center. (The full module will be six racks long; the mockup is three racks long). Listening at center is former astronaut Brewster Shaw (center), now a program official with the Boeing Co., the ISS prime",
   "center": "MSFC",
   "date_created": "2000-01-30T00:00:00Z",
   "keywords": [
    "Destiny laboratory",
    "International Space Station",
    "ISS",
    "mockup"
   ],
   "thumb": "https://images-assets.nasa.gov/image/0003787/0003787~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/0003787/0003787~medium.jpg",
   "api_query": "International Space Station Destiny laboratory",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss015e27411",
   "title": "View of Anderson working with SAME Hardware in the US Lab during Expedition 15",
   "description": "ISS015-E-27411 (8 Sept. 2007) --- NASA astronaut Clay Anderson, Expedition 15 flight engineer, works on the Smoke and Aerosol Measurement Experiment (SAME) hardware located in the Microgravity Science Glovebox (MSG) in the Destiny laboratory of the International Space Station. SAME will measure the smoke properties, or particle size distribution, of typical particles that are produced from different materials that can be found onboard station and other spacecrafts. SAME aims to test the performance of ionization smoke detectors and evaluate the performance of the photoelectric smoke detectors.",
   "center": "JSC",
   "date_created": "2007-09-08T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss015e27411/iss015e27411~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss015e27411/iss015e27411~medium.jpg",
   "api_query": "smoke aerosol measurement experiment SAME",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss015e27397",
   "title": "View of working with SAME Hardware in the US Lab during Expedition 15",
   "description": "ISS015-E-27397 (8 Sept. 2007) --- NASA astronaut Clay Anderson, Expedition 15 flight engineer, pauses for a photo while working on the Smoke and Aerosol Measurement Experiment (SAME) hardware located in the Microgravity Science Glovebox (MSG) in the Destiny laboratory of the International Space Station. SAME will measure the smoke properties, or particle size distribution, of typical particles that are produced from different materials that can be found onboard station and other spacecrafts. SAME aims to test the performance of ionization smoke detectors and evaluate the performance of the pho",
   "center": "JSC",
   "date_created": "2007-09-08T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss015e27397/iss015e27397~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss015e27397/iss015e27397~medium.jpg",
   "api_query": "smoke aerosol measurement experiment SAME",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss015e27425",
   "title": "View of Anderson working with SAME Hardware in the US Lab during Expedition 15",
   "description": "ISS015-E-27425 (8 Sept. 2007) --- NASA astronaut Clay Anderson, Expedition 15 flight engineer, works on the Smoke and Aerosol Measurement Experiment (SAME) hardware located in the Microgravity Science Glovebox (MSG) in the Destiny laboratory of the International Space Station. SAME will measure the smoke properties, or particle size distribution, of typical particles that are produced from different materials that can be found onboard station and other spacecrafts. SAME aims to test the performance of ionization smoke detectors and evaluate the performance of the photoelectric smoke detectors.",
   "center": "JSC",
   "date_created": "2007-09-08T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss015e27425/iss015e27425~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss015e27425/iss015e27425~medium.jpg",
   "api_query": "smoke aerosol measurement experiment SAME",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss015e26252",
   "title": "View of Anderson setting up SAME Hardware in the US Lab during Expedition 15",
   "description": "ISS015-E-26252 (1 Sept. 2007) --- Astronaut Clay Anderson, Expedition 15 flight engineer, works on the Smoke and Aerosol Measurement Experiment (SAME) hardware setup located in the Microgravity Science Glovebox (MSG) in the Destiny laboratory of the International Space Station. SAME will measure the smoke properties, or particle size distribution, of typical particles that are produced from different materials that can be found onboard station and other spacecrafts. SAME aims to test the performance of ionization smoke detectors and evaluate the performance of the photoelectric smoke detectors",
   "center": "JSC",
   "date_created": "2007-09-01T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/iss015e26252/iss015e26252~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss015e26252/iss015e26252~medium.jpg",
   "api_query": "smoke aerosol measurement experiment SAME",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "S106E5142",
   "title": "Commander Wilcutt works on the Zvezda / Service Module during STS-106",
   "description": "STS106-E-5142 (12 September 2000) ---  Astronaut Terrence W. Wilcutt, mission commander, works to prepare the interior of the Zvezda service module on the International Space Station (ISS) for   astronauts and cosmonauts who will soon start to live there.",
   "center": "JSC",
   "date_created": "2000-09-12T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/S106E5142/S106E5142~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/S106E5142/S106E5142~medium.jpg",
   "api_query": " astronaut ISS interior",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "iss042e099123",
   "title": "iss042e099123",
   "description": "ISS042E099123 (01/04/2015) --- An interior view from the International Space Station\u2019s (ISS) Cupola module. The large bay windows allowing the Expedition 42 crew to see outside. The Cupola houses one of the station\u2019s two robotic work stations used by astronauts to manipulate the large robotic arm seen through the right window. The robotic arm, or Canadarm2, was used throughout the construction of the ISS and is still used to grapple visiting cargo vehicles and assist astronauts during spacewalks. The Cupola is attached to the nadir side of the space station and also gives a full panoramic view",
   "center": "JSC",
   "date_created": "2015-01-04T23:02:47Z",
   "keywords": [
    "TWEETED PHOTO",
    "SOCIAL MEDIA"
   ],
   "thumb": "https://images-assets.nasa.gov/image/iss042e099123/iss042e099123~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/iss042e099123/iss042e099123~medium.jpg",
   "api_query": " astronaut ISS interior",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "sts088-359-003",
   "title": "Sturckow in the Node 1/Unity module",
   "description": "STS088-359-003 (4-15 Dec. 1998) --- Astronaut Frederick W. ?Rick? Sturckow, pilot, holds up a panel while putting final touches on the interior of Node 1 or Unity.  Sturckow, who had been working with a battery-powered tool, was joined by other crew members in preparing the module for its International Space Station (ISS) duty.",
   "center": "JSC",
   "date_created": "1999-01-11T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/sts088-359-003/sts088-359-003~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/sts088-359-003/sts088-359-003~medium.jpg",
   "api_query": " astronaut ISS interior",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  },
  {
   "nasa_id": "s98e5160",
   "title": "Expedition One CDR Shepherd in U.S. Laboratory / Destiny module",
   "description": "STS98-E-5160 (11 February 2001) --- Astronaut William M. (Bill) Shepherd,  Expedition One commander, surveys the interior of the newly attached Destiny laboratory onboard the International Space Station (ISS).  After the Destiny hatch was opened early in the day, members of both crews went to work quickly inside the new module, activating air systems, fire extinguishers, alarm systems, computers and internal communications. The crews also took some photos and continued equipment transfers from the shuttle to the station. The scene was taken with a digital still camera.",
   "center": "JSC",
   "date_created": "2001-02-11T00:00:00Z",
   "keywords": [],
   "thumb": "https://images-assets.nasa.gov/image/s98e5160/s98e5160~medium.jpg",
   "full": "https://images-assets.nasa.gov/image/s98e5160/s98e5160~large.jpg",
   "api_query": " astronaut ISS interior",
   "provenance": "NASA Images and Video Library (images.nasa.gov)"
  }
 ]
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/psi_fetch_ledger.json', '{
 "fetched_at": "2026-11-11T19:35:26Z",
 "source": "NASA Physical Sciences Informatics (psi.nasa.gov) public download endpoint",
 "license_note": "NASA public data; cite DOI per investigation",
 "investigations": [
  {
   "accession": "PSI-142",
   "title": "Quantitative Studies of Cool Flame Transitions at Radiation / Stretch Extinction Using Counterflow Flames",
   "version": 2,
   "doi": "10.60555/80qf-vj95",
   "fetched_at": "2026-11-11T19:33:36Z",
   "files": [
    {
     "file_name": "PSI-142_Experimental table_Data Summary Table.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-142/download?file=PSI-142_Experimental%20table_Data%20Summary%20Table.csv&version=1",
     "status": "200",
     "bytes": 727,
     "download_ok": true,
     "sha256": "c66d135b0053590d239f06b9e8627d826e3d726b8443fd2cbccc37484b6a8e7f"
    }
   ]
  },
  {
   "accession": "PSI-62",
   "title": "Concurrent Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography",
   "version": 1,
   "doi": "10.60555/e9xp-ex83",
   "fetched_at": "2026-11-11T19:33:38Z",
   "files": []
  },
  {
   "accession": "PSI-60",
   "title": "Computational and Experimental Analysis of SPICE Data Sets",
   "version": 1,
   "doi": "10.60555/mzjm-yv57",
   "fetched_at": "2026-11-11T19:33:39Z",
   "files": []
  },
  {
   "accession": "PSI-26",
   "title": "Burning and Suppression of Solids",
   "version": 4,
   "doi": "10.60555/58h4-dy80",
   "fetched_at": "2026-11-11T19:33:41Z",
   "files": [
    {
     "file_name": "PSI-26_Experimental table_BASS.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-26/download?file=PSI-26_Experimental%20table_BASS.csv&version=1",
     "status": "200",
     "bytes": 4726,
     "download_ok": true,
     "sha256": "ccfc3c54d948b64a1c5d2596a63c7c8019e51df0c91a1d62f039f48fa28c300f"
    }
   ]
  },
  {
   "accession": "PSI-106",
   "title": "Structure and Liftoff In Combustion Experiment",
   "version": 3,
   "doi": "10.60555/pm12-rg61",
   "fetched_at": "2026-11-11T19:33:53Z",
   "files": [
    {
     "file_name": "PSI-106_Experimental table_Slice.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-106/download?file=PSI-106_Experimental%20table_Slice.csv&version=1",
     "status": "200",
     "bytes": 734,
     "download_ok": true,
     "sha256": "89ef980810ca6d9aa8be817b42e36cd2adff23f5e9058361b5a33d18b4363f4d"
    }
   ]
  },
  {
   "accession": "PSI-98",
   "title": "Spacecraft Fire Safety Experiment-I",
   "version": 4,
   "doi": "10.60555/0t15-1z43",
   "fetched_at": "2026-11-11T19:33:57Z",
   "files": [
    {
     "file_name": "PSI-98_Experimental table_SAFFIRE-1.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-98/download?file=PSI-98_Experimental%20table_SAFFIRE-1.csv&version=1",
     "status": "200",
     "bytes": 469,
     "download_ok": true,
     "sha256": "c01f29c62455f0a3b512290ab85e5687ecded326733189f002f580368402308d"
    }
   ]
  },
  {
   "accession": "PSI-117",
   "title": "Effect of External Thermo-Convective Perturbation on Cool Flame Dynamics: A Multidimensional Multi-Physics CFD Analysis",
   "version": 2,
   "doi": "10.60555/gz0q-b577",
   "fetched_at": "2026-11-11T19:33:59Z",
   "files": []
  },
  {
   "accession": "PSI-115",
   "title": "Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation in Micro-Gravity",
   "version": 3,
   "doi": "10.60555/q0v5-1v28",
   "fetched_at": "2026-11-11T19:34:01Z",
   "files": []
  },
  {
   "accession": "PSI-47",
   "title": "Dust and Aerosol Measurement Feasibility Test / Dust and Aerosol Measurement Feasibility Test-2",
   "version": 5,
   "doi": "10.60555/ztgj-d202",
   "fetched_at": "2026-11-11T19:34:02Z",
   "files": [
    {
     "file_name": "PSI-47_Experimental table_DAFT.csv",
     "version": 2,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-47/download?file=PSI-47_Experimental%20table_DAFT.csv&version=2",
     "status": "200",
     "bytes": 518,
     "download_ok": true,
     "sha256": "d9d1a436c6e7bbc410b433e04575fe7dedaff763b5237d688089929b7393b5c0"
    }
   ]
  },
  {
   "accession": "PSI-100",
   "title": "Spacecraft Fire Experiment-III",
   "version": 4,
   "doi": "10.60555/040q-4h36",
   "fetched_at": "2026-11-11T19:34:05Z",
   "files": [
    {
     "file_name": "PSI-100_Experimental table_SAFFIRE-3.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-100/download?file=PSI-100_Experimental%20table_SAFFIRE-3.csv&version=1",
     "status": "200",
     "bytes": 239,
     "download_ok": true,
     "sha256": "4d3c717ec20dd0247db670b2784a9fd7d746788bc54a936f80693e48eb8cd117"
    }
   ]
  },
  {
   "accession": "PSI-39",
   "title": "Cool Flames Investigation",
   "version": 4,
   "doi": "10.60555/m6pj-a914",
   "fetched_at": "2026-11-11T19:34:12Z",
   "files": [
    {
     "file_name": "PSI-39_Experimental table_CFI.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-39/download?file=PSI-39_Experimental%20table_CFI.csv&version=1",
     "status": "200",
     "bytes": 7792,
     "download_ok": true,
     "sha256": "fb898e28762353aa132c16b886dbd207a024b1dd3c9bed5928d70d8036d2ec7e"
    }
   ]
  },
  {
   "accession": "PSI-102",
   "title": "Smoke and Aerosol Measurement Experiment",
   "version": 4,
   "doi": "10.60555/gd4k-8h62",
   "fetched_at": "2026-11-11T19:34:15Z",
   "files": [
    {
     "file_name": "PSI-102_Experimental table_SAME.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-102/download?file=PSI-102_Experimental%20table_SAME.csv&version=1",
     "status": "200",
     "bytes": 331,
     "download_ok": true,
     "sha256": "268d1e121d2f211b124407dd32b9475617bd269ede2c2d1749441da3e949a2af"
    }
   ]
  },
  {
   "accession": "PSI-159",
   "title": "Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases",
   "version": 1,
   "doi": "10.60555/cyt1-kh64",
   "fetched_at": "2026-11-11T19:34:20Z",
   "files": [
    {
     "file_name": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-159/download?file=PSI-159_Experimental%20table_CFI-G_Normal%20Flames.csv&version=1",
     "status": "200",
     "bytes": 22166,
     "download_ok": true,
     "sha256": "d95a621c3fbd27d204dd32ed29fa17d68f2b779d6a523cde8479ed7ebaa5251a"
    },
    {
     "file_name": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-159/download?file=PSI-159_Experimental%20table_CFI-G_Inverse%20Flames.csv&version=1",
     "status": "200",
     "bytes": 39422,
     "download_ok": true,
     "sha256": "d4d44f8b9896936728748e34d1b6ad0812032a92fa5289599b708c138e3a9b39"
    }
   ]
  },
  {
   "accession": "PSI-101",
   "title": "Smoke Aerosol Measurement Experiment-Reflight",
   "version": 4,
   "doi": "10.60555/2np7-jv14",
   "fetched_at": "2026-11-11T19:34:26Z",
   "files": [
    {
     "file_name": "PSI-101_Experimental table_SAME-R.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-101/download?file=PSI-101_Experimental%20table_SAME-R.csv&version=1",
     "status": "200",
     "bytes": 5674,
     "download_ok": true,
     "sha256": "87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef"
    }
   ]
  },
  {
   "accession": "PSI-25",
   "title": "Burning and Suppression of Solids - II",
   "version": 4,
   "doi": "10.60555/4qc4-de67",
   "fetched_at": "2026-11-11T19:34:30Z",
   "files": [
    {
     "file_name": "PSI-25_Experimental table_BASS-II.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?file=PSI-25_Experimental%20table_BASS-II.csv&version=1",
     "status": "200",
     "bytes": 16590,
     "download_ok": true,
     "sha256": "71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042"
    }
   ]
  },
  {
   "accession": "PSI-99",
   "title": "Spacecraft Fire Experiment-II",
   "version": 5,
   "doi": "10.60555/2chp-m469",
   "fetched_at": "2026-11-11T19:34:33Z",
   "files": [
    {
     "file_name": "PSI-99_Experimental table_SAFFIRE-2.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-99/download?file=PSI-99_Experimental%20table_SAFFIRE-2.csv&version=1",
     "status": "200",
     "bytes": 1973,
     "download_ok": true,
     "sha256": "3c24390b9ef86f3d1ebaab911a1a3cc95a8759aebf42062371370e6d4b31b8ac"
    }
   ]
  },
  {
   "accession": "PSI-22",
   "title": "Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames",
   "version": 7,
   "doi": "10.60555/se5a-8c73",
   "fetched_at": "2026-11-11T19:34:37Z",
   "files": [
    {
     "file_name": "PSI-22_Experimental table_ACME E-FIELD Flames.csv",
     "version": 2,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-22/download?file=PSI-22_Experimental%20table_ACME%20E-FIELD%20Flames.csv&version=2",
     "status": "200",
     "bytes": 2475,
     "download_ok": true,
     "sha256": "69090c357b83ae38d161d29001d1d32b40fd77b13324ca6585ee990cdceef524"
    }
   ]
  },
  {
   "accession": "PSI-107",
   "title": "Smoke Point In Co-flow Experiment",
   "version": 4,
   "doi": "10.60555/9kbh-e962",
   "fetched_at": "2026-11-11T19:34:43Z",
   "files": [
    {
     "file_name": "PSI-107_Experimental table_Spice.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-107/download?file=PSI-107_Experimental%20table_Spice.csv&version=1",
     "status": "200",
     "bytes": 31205,
     "download_ok": true,
     "sha256": "fb0d7e60cf5367afb429089e9901d27288f78038efd26c8de1db4fbe04117136"
    }
   ]
  },
  {
   "accession": "PSI-21",
   "title": "Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame",
   "version": 4,
   "doi": "10.60555/23e1-9950",
   "fetched_at": "2026-11-11T19:34:48Z",
   "files": [
    {
     "file_name": "PSI-21_Experimental table_CLD Flame.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-21/download?file=PSI-21_Experimental%20table_CLD%20Flame.csv&version=1",
     "status": "200",
     "bytes": 2454,
     "download_ok": true,
     "sha256": "9fafbc5b3dddaf715ce8025ed9154ce297803f7b69a935f077ec26c8249e44c0"
    }
   ]
  },
  {
   "accession": "PSI-20",
   "title": "Advanced Combustion via Microgravity Experiments - Burning Rate Emulator",
   "version": 4,
   "doi": "10.60555/vb93-3y72",
   "fetched_at": "2026-11-11T19:34:52Z",
   "files": [
    {
     "file_name": "PSI-20_Experimental table_ACME BRE.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-20/download?file=PSI-20_Experimental%20table_ACME%20BRE.csv&version=1",
     "status": "200",
     "bytes": 1113,
     "download_ok": true,
     "sha256": "4aa5d3f98708ceacced5c620d46858b9965f8d4d941b203229f46467d53e5ab7"
    }
   ]
  },
  {
   "accession": "PSI-23",
   "title": "Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames",
   "version": 4,
   "doi": "10.60555/k57n-p030",
   "fetched_at": "2026-11-11T19:35:02Z",
   "files": [
    {
     "file_name": "PSI-23_Experimental table_ACME s-Flame.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-23/download?file=PSI-23_Experimental%20table_ACME%20s-Flame.csv&version=1",
     "status": "200",
     "bytes": 2456,
     "download_ok": true,
     "sha256": "16cd10f50bd2e962887c8eb4077e5a9b3e790c78de8e0361c0b77e19300be7cf"
    }
   ]
  },
  {
   "accession": "PSI-10",
   "title": "Advanced Combustion via Microgravity Experiments / Flame Design",
   "version": 1,
   "doi": "10.60555/w4zy-bt45",
   "fetched_at": "2026-11-11T19:35:08Z",
   "files": [
    {
     "file_name": "PSI-10_Experimental table_Flame Design_Normal Flame.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-10/download?file=PSI-10_Experimental%20table_Flame%20Design_Normal%20Flame.csv&version=1",
     "status": "200",
     "bytes": 26933,
     "download_ok": true,
     "sha256": "4a663292bd3f65201943cc71bd661a70383639276a9176f64105b285bf0b6deb"
    },
    {
     "file_name": "PSI-10_Experimental table_Flame Design_Inverse Flame.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-10/download?file=PSI-10_Experimental%20table_Flame%20Design_Inverse%20Flame.csv&version=1",
     "status": "200",
     "bytes": 17314,
     "download_ok": true,
     "sha256": "97933ee9ae0b9ebc6b948a67485a0fe2f8218f753253a4f2be93c40d374c44e4"
    }
   ]
  },
  {
   "accession": "PSI-69",
   "title": "Flame Extinguishment Experiment",
   "version": 5,
   "doi": "10.60555/mbq8-0451",
   "fetched_at": "2026-11-11T19:35:15Z",
   "files": [
    {
     "file_name": "PSI-69_Experimental table_FLEX.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-69/download?file=PSI-69_Experimental%20table_FLEX.csv&version=1",
     "status": "200",
     "bytes": 24776,
     "download_ok": true,
     "sha256": "37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96"
    }
   ]
  },
  {
   "accession": "PSI-68",
   "title": "Flame Extinguishment Experiment - 2",
   "version": 6,
   "doi": "10.60555/byp8-h018",
   "fetched_at": "2026-11-11T19:35:24Z",
   "files": [
    {
     "file_name": "PSI-68_Experimental table_Flex2.csv",
     "version": 1,
     "url": "https://psi.nasa.gov/geode-py/ws/studies/PSI-68/download?file=PSI-68_Experimental%20table_Flex2.csv&version=1",
     "status": "200",
     "bytes": 1029,
     "download_ok": true,
     "sha256": "cc57ad1bd9977aa13e7ac6c3aa618303012686e232b36c052c6a9f1a74e5f528"
    }
   ]
  }
 ]
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/audit.json', '{
  "ranAt": "2026-11-12T21:01:04.925Z",
  "triggeredBy": "user-confirmation",
  "batchesReconciled": [
    "B-20261112-001",
    "B-20261112-002",
    "B-20261112-003",
    "B-20261112-004",
    "B-20261112-005",
    "B-20261112-006",
    "B-20261112-007"
  ],
  "crossBatchDuplicates": [],
  "datasetInventory": [
    {
      "id": "B-20261112-001:f001:t1",
      "source": "test-upload.csv — test-upload",
      "rows": 2,
      "columns": [
        "Sample (Fuel Type)",
        "Initial Droplet Diameter (mm)",
        "Ambient Gas Mixture",
        "Oxygen Mole Fraction",
        "Ambient Pressure (atm)",
        "Ambient Temperature (C)",
        "Flow Velocity (cm/s)"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f001:t1",
      "source": "PSI-100_Experimental table_SAFFIRE-3.csv — PSI-100_Experimental table_SAFFIRE-3",
      "rows": 2,
      "columns": [
        "Sample Number",
        "Material",
        "Sample Thickness",
        "Sample Length",
        "Sample Width",
        "Air Flow",
        "Direction",
        "Camera 1",
        "Camera 2"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f002:t1",
      "source": "PSI-101_Experimental table_SAME-R.csv — PSI-101_Experimental table_SAME-R",
      "rows": 109,
      "columns": [
        "Sample Type",
        "SAME Test #",
        "Description",
        "Date",
        "Inlet velocity (cm/s)",
        "Rt/R0",
        "Duration (sec)",
        "Primary aging time (sec)",
        "Primary mixing time (sec)",
        "Net aging time (sec)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f003:t1",
      "source": "PSI-102_Experimental table_SAME.csv — PSI-102_Experimental table_SAME",
      "rows": 8,
      "columns": [
        "Sample #",
        "Sample Material",
        "Air Flow (cm/s)",
        "Weight loss rate (mg/min)",
        "Aging Duration (minutes)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f004:t1",
      "source": "PSI-106_Experimental table_Slice.csv — PSI-106_Experimental table_Slice",
      "rows": 12,
      "columns": [
        "Test Date",
        "Fuel Type"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f005:t1",
      "source": "PSI-107_Experimental table_Spice.csv — PSI-107_Experimental table_Spice",
      "rows": 469,
      "columns": [
        "GMT date",
        "GMT ignition",
        "GMT  Flame Off",
        "Fuel",
        "Nozzle (mm)",
        "Fuel Rate (sccm)",
        "Fuel Rate (mg/s)",
        "HC Fuel Rate (mg/s)",
        "Air Rate (cm/s)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f006:t1",
      "source": "PSI-10_Experimental table_Flame Design_Inverse Flame.csv — PSI-10_Experimental table_Flame Design_Inverse Flame",
      "rows": 120,
      "columns": [
        "Flame Type",
        "Day",
        "Test",
        "XO2",
        "mO2 (mg/s)",
        "mN2 (mg/s)",
        "mtot (mg/s)",
        "XC2H4 initial",
        "XC2H4 final",
        "pinit (atm)",
        "pfinal (atm)",
        "pmean (atm)",
        "mean Zst",
        "Tad (K)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f007:t1",
      "source": "PSI-10_Experimental table_Flame Design_Normal Flame.csv — PSI-10_Experimental table_Flame Design_Normal Flame",
      "rows": 207,
      "columns": [
        "Flame Type",
        "Day",
        "Fuel",
        "Test",
        "Xfuel",
        "mfuel (mg/s)",
        "mN2 (mg/s)",
        "mtot (mg/s)",
        "XO2 (init)",
        "XO2 (final)",
        "pinit (atm)",
        "pfinal (atm)",
        "pmean (atm)",
        "mean Zst",
        "Tad (K)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f008:t1",
      "source": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv — PSI-159_Experimental table_CFI-G_Inverse Flames",
      "rows": 154,
      "columns": [
        "Flame Type",
        "Day",
        "Fuel",
        "Test",
        "Xf  before test",
        "Xf  after test",
        "approx p (bar)",
        "XO2",
        "HC burnrate (mg/s)",
        "O2 flow rate (mg/s)",
        "TFP",
        "Tad (K)",
        "Zst",
        "Hot ignition",
        "burn time (sec)",
        "Self -ext or flow term",
        "Peak burner Temp (C)",
        "Peak burner temp (K)",
        "Color",
        "Comments"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f009:t1",
      "source": "PSI-159_Experimental table_CFI-G_Normal Flames.csv — PSI-159_Experimental table_CFI-G_Normal Flames",
      "rows": 179,
      "columns": [
        "Flame Type",
        "Day",
        "Fuel",
        "Test",
        "Cool flame?",
        "XO2 before test",
        "XO2  after test",
        "approx p (bar)",
        "Xf",
        "mHC (mg/s)",
        "TFP",
        "Tad (K)",
        "Zst",
        "Hot ignition",
        "burn time (sec)",
        "Self-ext or flow term",
        "Peak burner T (C )",
        "Comments"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-002:f010:t1",
      "source": "PSI-20_Experimental table_ACME BRE.csv — PSI-20_Experimental table_ACME BRE",
      "rows": 18,
      "columns": [
        "Year",
        "Month",
        "Date",
        "Burner Size (mm)",
        "Fuel Bottle",
        "Oxygen Conc (percent)",
        "Flames Ignited",
        "Notes"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f001:t1",
      "source": "PSI-21_Experimental table_CLD Flame.csv — PSI-21_Experimental table_CLD Flame",
      "rows": 32,
      "columns": [
        "Test Type",
        "Test Day",
        "Fuel MFC",
        "N2 MFC",
        "Fuel Bottle",
        "Fuel conc. Range",
        "Flames ignited",
        "Notes"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f002:t1",
      "source": "PSI-22_Experimental table_ACME E-FIELD Flames.csv — PSI-22_Experimental table_ACME E-FIELD Flames",
      "rows": 32,
      "columns": [
        "Test Type",
        "Test Day",
        "Year",
        "Month",
        "Date",
        "Mesh Polarity",
        "Fuel Bottle",
        "Fuel Conc",
        "Flames Ignited",
        "Notes"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f003:t1",
      "source": "PSI-23_Experimental table_ACME s-Flame.csv — PSI-23_Experimental table_ACME s-Flame",
      "rows": 18,
      "columns": [
        "Test Type",
        "Test Day*",
        "Year",
        "Month",
        "Date",
        "Atmosphere*",
        "Fuel Bottle",
        "Flames Ignited*",
        "Notes"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f004:t1",
      "source": "PSI-25_Experimental table_BASS-II.csv — PSI-25_Experimental table_BASS-II",
      "rows": 129,
      "columns": [
        "PI",
        "Test #",
        "Date",
        "GMT",
        "Sample #",
        "Fuel Sample Material",
        "Flow restrictor",
        "Fan display",
        "Air display",
        "Radiometer gain   (1000   250   50   10)",
        "Total Frames Shot",
        "Calibrated  initial O2 % by vol",
        "Calibrated final O2 % by vol",
        "Initial CO2 % by vol",
        "Final CO2 % by vol",
        "Initial CO (ppm)",
        "Final CO (ppm)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f005:t1",
      "source": "PSI-26_Experimental table_BASS.csv — PSI-26_Experimental table_BASS",
      "rows": 122,
      "columns": [
        "Date",
        "GMT",
        "As Run Test #",
        "Test #",
        "Sample #",
        "Fuel Sample Material"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f006:t1",
      "source": "PSI-39_Experimental table_CFI.csv — PSI-39_Experimental table_CFI",
      "rows": 87,
      "columns": [
        "Flex Number",
        "Test Date",
        "Local Time",
        "CIR",
        "Pressure",
        "Oxygen",
        "Nitrogen",
        "Helium",
        "Fiber",
        "Fuel"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f007:t1",
      "source": "PSI-68_Experimental table_Flex2.csv — PSI-68_Experimental table_Flex2",
      "rows": 8,
      "columns": [
        "Sample (Fuel Type)",
        "Initial Droplet Diameter (mm)",
        "Ambient Gas Mixture",
        "Oxygen Mole Fraction",
        "Ambient Pressure (atm)",
        "Ambient Temperature (C)",
        "Flow Velocity (cm/s)"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f008:t1",
      "source": "PSI-69_Experimental table_FLEX.csv — PSI-69_Experimental table_FLEX",
      "rows": 274,
      "columns": [
        "FLEX Test #",
        "FLEX Identifier",
        "Test Date",
        "Test GMT",
        "Fuel",
        "Ambient pressure; mmHg",
        "O initial ambient composition; mole fraction",
        "N initial ambient composition; mole fraction",
        "CO initial ambient composition; mole fraction",
        "He initial ambient composition; mole fraction",
        "Droplet initial diameter; mm",
        "Visible flame extinction diameter; mm",
        "Burning rate; mm",
        "Burn time; s",
        "Test end"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-003:f009:t1",
      "source": "PSI-99_Experimental table_SAFFIRE-2.csv — PSI-99_Experimental table_SAFFIRE-2",
      "rows": 15,
      "columns": [
        "Sample Number",
        "Material",
        "Samle Thickness",
        "Sample Length",
        "Sample Width (cm)",
        "Air Flow (cm/s)",
        "Percent O2 (Note 1)",
        "Ignition Power (W)",
        "Ignition Time (s)",
        "Burn Time (s)",
        "Flow Direction",
        "?-g Burn Length",
        "?-g Spread Length",
        "1-g Burn Length",
        "1-g Spread Rate",
        "Camera 1",
        "Camera 2"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-004:f005:t1",
      "source": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-1",
      "rows": 3,
      "columns": [
        "•",
        "Combustion is the primary man-made contributor to acid rain."
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-004:f005:t2",
      "source": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-2",
      "rows": 3,
      "columns": [
        "•",
        "ACME Image Processing Software (OMA2 and QtOma)"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-004:f005:t3",
      "source": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-3",
      "rows": 4,
      "columns": [
        "•",
        "NASA Glenn Research Center (lead center for ISS combustion research)"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-006:f006:t1",
      "source": "1-s2.0-S0010218022004606-main.pdf — pdf-heuristic-table-1",
      "rows": 12,
      "columns": [
        "Testpoints",
        "Fuel",
        "Fuel Velocity",
        "Coflow Air (3.1 cm/s)",
        "Electric Field Direction"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-006:f008:t1",
      "source": "1-s2.0-S001021802300233X-am.pdf — pdf-table-p4-1",
      "rows": 7,
      "columns": [
        "col_1",
        "col_2",
        "col_3"
      ],
      "qualityFlags": [
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-006:f008:t2",
      "source": "1-s2.0-S001021802300233X-am.pdf — pdf-table-p5-2",
      "rows": 7,
      "columns": [
        "Cool"
      ],
      "qualityFlags": [
        "single column",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t1",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-1",
      "rows": 6,
      "columns": [
        "col_1",
        "col_2"
      ],
      "qualityFlags": [
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t2",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-2",
      "rows": 3,
      "columns": [
        "col_1",
        "col_2"
      ],
      "qualityFlags": [
        "< 5 rows",
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t3",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-3",
      "rows": 3,
      "columns": [
        "col_1",
        "col_2"
      ],
      "qualityFlags": [
        "< 5 rows",
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t4",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-4",
      "rows": 6,
      "columns": [
        "col_1",
        "4 cm HAB - Exp."
      ],
      "qualityFlags": [
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t5",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p14-5",
      "rows": 15,
      "columns": [
        "col_1",
        "col_2"
      ],
      "qualityFlags": [
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f003:t6",
      "source": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p14-6",
      "rows": 3,
      "columns": [
        "col_1",
        "col_2",
        "col_3"
      ],
      "qualityFlags": [
        "< 5 rows",
        "placeholder column names — header mapping needed",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t1",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-1",
      "rows": 2,
      "columns": [
        "1 School of Applied Mathematics and Computational Physics, Peter the Great St. Petersburg",
        "6"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t2",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-2",
      "rows": 18,
      "columns": [
        "Word count",
        "12"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t3",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-3",
      "rows": 18,
      "columns": [
        "Transient dynamics of growing diffusion flames produced by a low-momentum fuel flow emanating",
        "33"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t4",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-4",
      "rows": 9,
      "columns": [
        "1. Introduction",
        "55"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t5",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-5",
      "rows": 14,
      "columns": [
        "Meanwhile, this kind of flame develops in combustion of solid materials, and (for a given",
        "66"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t6",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-6",
      "rows": 2,
      "columns": [
        "the flames were produced by the 25 mm diameter BRE burner with the igniter (taken away after",
        "81"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t7",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-7",
      "rows": 4,
      "columns": [
        "In total, 79 orbital experiments have been undertaken so far with the following parameters.",
        "88"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t8",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-8",
      "rows": 7,
      "columns": [
        "In this paper, we apply the comprehensive model developed in Refs. [6, 7] (comprising multi-step",
        "94"
      ],
      "qualityFlags": [
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t9",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-9",
      "rows": 2,
      "columns": [
        "In the first round of the BRE (Flamenco) experiment, it has been observed that the flames are long-",
        "103"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    },
    {
      "id": "B-20261112-007:f004:t10",
      "source": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-10",
      "rows": 2,
      "columns": [
        "above-listed test scenarios, we focus on those replicating the low-momentum diffusion combustion",
        "106"
      ],
      "qualityFlags": [
        "< 5 rows",
        "human review pending"
      ],
      "harmonizationNotes": "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review."
    }
  ],
  "mlEligibilityPreAssessment": [
    {
      "dataset": "test-upload.csv — test-upload",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-100_Experimental table_SAFFIRE-3.csv — PSI-100_Experimental table_SAFFIRE-3",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-101_Experimental table_SAME-R.csv — PSI-101_Experimental table_SAME-R",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-102_Experimental table_SAME.csv — PSI-102_Experimental table_SAME",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-106_Experimental table_Slice.csv — PSI-106_Experimental table_Slice",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-107_Experimental table_Spice.csv — PSI-107_Experimental table_Spice",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-10_Experimental table_Flame Design_Inverse Flame.csv — PSI-10_Experimental table_Flame Design_Inverse Flame",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-10_Experimental table_Flame Design_Normal Flame.csv — PSI-10_Experimental table_Flame Design_Normal Flame",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv — PSI-159_Experimental table_CFI-G_Inverse Flames",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-159_Experimental table_CFI-G_Normal Flames.csv — PSI-159_Experimental table_CFI-G_Normal Flames",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-20_Experimental table_ACME BRE.csv — PSI-20_Experimental table_ACME BRE",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-21_Experimental table_CLD Flame.csv — PSI-21_Experimental table_CLD Flame",
      "eligibleTasks": [
        "exploratory descriptive analysis"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-22_Experimental table_ACME E-FIELD Flames.csv — PSI-22_Experimental table_ACME E-FIELD Flames",
      "eligibleTasks": [
        "exploratory descriptive analysis"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-23_Experimental table_ACME s-Flame.csv — PSI-23_Experimental table_ACME s-Flame",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-25_Experimental table_BASS-II.csv — PSI-25_Experimental table_BASS-II",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-26_Experimental table_BASS.csv — PSI-26_Experimental table_BASS",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-39_Experimental table_CFI.csv — PSI-39_Experimental table_CFI",
      "eligibleTasks": [
        "exploratory descriptive analysis"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-68_Experimental table_Flex2.csv — PSI-68_Experimental table_Flex2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-69_Experimental table_FLEX.csv — PSI-69_Experimental table_FLEX",
      "eligibleTasks": [
        "exploratory descriptive analysis",
        "candidate regression/classification — pending label audit"
      ],
      "blockers": [
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "PSI-99_Experimental table_SAFFIRE-2.csv — PSI-99_Experimental table_SAFFIRE-2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-1",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "advanced-combustion-via-microgravity-experiments-acme.pdf — pdf-heuristic-table-3",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S0010218022004606-main.pdf — pdf-heuristic-table-1",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S001021802300233X-am.pdf — pdf-table-p4-1",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S001021802300233X-am.pdf — pdf-table-p5-2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-1",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-3",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p13-4",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p14-5",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920300602-am.pdf — pdf-table-p14-6",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "columns not yet mapped to canonical variables",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-1",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-2",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-3",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-4",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-5",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-6",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-7",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-8",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-9",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    },
    {
      "dataset": "1-s2.0-S1540748920301711-am.pdf — pdf-heuristic-table-10",
      "eligibleTasks": [
        "descriptive registration only"
      ],
      "blockers": [
        "too few rows for any supervised task",
        "outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)"
      ],
      "humanReviewRequired": true
    }
  ],
  "knowledgeGraphNodes": 115,
  "knowledgeGraphEdges": 21825,
  "reportPath": "reports/GLOBAL_AUDIT_2026-11-12T21-01-04-925Z.md"
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/d2law_validation.json', '{
 "source": "PSI-69_FLEX (canonical corpus, SHA-256-verified)",
 "computedAt": "2026-11-13T18:29:13.998Z",
 "note": "d2-law: d(t) = d0*sqrt(1 - t/t_life), t_life = d0^2/K; K reported directly in the recovered table as ''Burning rate'' (mm^2/s)",
 "usable_rows": 259,
 "internal_consistency": {
  "n": 256,
  "mae_s": 10.254,
  "rmse_s": 18.992,
  "median_s": 4.634
 },
 "burning_rate_by_fuel": {
  "Heptane": {
   "n": 106,
   "median_mm2_s": 0.54,
   "min": 0.05,
   "max": 1.06,
   "lit_range_note": "classical microgravity droplet-burning K is commonly O(0.5-1.5) mm^2/s for methanol/heptane at these conditions",
   "within_lit_order_of_magnitude": false
  },
  "Methanol": {
   "n": 150,
   "median_mm2_s": 0.46,
   "min": 0.2,
   "max": 0.74,
   "lit_range_note": "classical microgravity droplet-burning K is commonly O(0.5-1.5) mm^2/s for methanol/heptane at these conditions",
   "within_lit_order_of_magnitude": true
  }
 },
 "lifetime_prediction": {
  "Heptane": {
   "n": 106,
   "K_used": 0.54,
   "mae_s": 8.58,
   "rmse_s": 12.25
  },
  "Methanol": {
   "n": 153,
   "K_used": 0.46,
   "mae_s": 7.87,
   "rmse_s": 10.44
  }
 },
 "limitations": [
  "Quasi-steady d2-law is an idealisation: real FLEX droplets show time-varying K, disruption events and radiative effects",
  "Internal consistency checks the table against itself (t = d0^2/K); it is NOT independent validation",
  "K-by-fuel medians are compared against published literature order-of-magnitude ranges as PARTIAL validation only"
 ],
 "validation_class": "partially_validated (internal consistency + literature order-of-magnitude; no independent campaign)"
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ml/experiment_log.json', '{
 "experiment_id": "M7-flex-extinction-20261114",
 "seed": 20261114,
 "runs": [
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.001
   },
   "grouping": "condition-group K=4 (v2 original protocol)",
   "foldAucs": [
    0.7872,
    0.8868,
    0.971,
    0.8394
   ],
   "meanAuc": 0.8711,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusionTotals": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "majority-class",
   "hyper": {},
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.5,
    0.5,
    0.5,
    0.5
   ],
   "meanAuc": 0.5,
   "meanBalancedAcc": 0.5,
   "meanF1": 0.8142,
   "confusionTotals": {
    "tp": 180,
    "tn": 0,
    "fp": 82,
    "fn": 0
   }
  },
  {
   "candidate": "o2-only-baseline",
   "hyper": {
    "direction": "lower O2 -> extinction"
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7697,
    0.8781,
    0.8397,
    0.7682
   ],
   "meanAuc": 0.8139,
   "meanBalancedAcc": 0.5,
   "meanF1": 0,
   "confusionTotals": {
    "tp": 0,
    "tn": 82,
    "fp": 0,
    "fn": 180
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.001
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7872,
    0.8868,
    0.971,
    0.8394
   ],
   "meanAuc": 0.8711,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusionTotals": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.01
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7885,
    0.8868,
    0.971,
    0.8394
   ],
   "meanAuc": 0.8714,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusionTotals": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.1
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7872,
    0.8859,
    0.971,
    0.8394
   ],
   "meanAuc": 0.8709,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusionTotals": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 1
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7822,
    0.8897,
    0.9698,
    0.8394
   ],
   "meanAuc": 0.8703,
   "meanBalancedAcc": 0.789,
   "meanF1": 0.8128,
   "confusionTotals": {
    "tp": 131,
    "tn": 70,
    "fp": 12,
    "fn": 49
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 3
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7559,
    0.7984,
    0.9663,
    0.7545
   ],
   "meanAuc": 0.8188,
   "meanBalancedAcc": 0.7654,
   "meanF1": 0.8488,
   "confusionTotals": {
    "tp": 150,
    "tn": 57,
    "fp": 25,
    "fn": 30
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 5
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7747,
    0.8506,
    0.9686,
    0.7566
   ],
   "meanAuc": 0.8376,
   "meanBalancedAcc": 0.7735,
   "meanF1": 0.8585,
   "confusionTotals": {
    "tp": 153,
    "tn": 57,
    "fp": 25,
    "fn": 27
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 7
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7666,
    0.8636,
    0.9721,
    0.7566
   ],
   "meanAuc": 0.8397,
   "meanBalancedAcc": 0.7791,
   "meanF1": 0.8606,
   "confusionTotals": {
    "tp": 153,
    "tn": 58,
    "fp": 24,
    "fn": 27
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 9
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7622,
    0.8636,
    0.9744,
    0.7606
   ],
   "meanAuc": 0.8402,
   "meanBalancedAcc": 0.7731,
   "meanF1": 0.8581,
   "confusionTotals": {
    "tp": 153,
    "tn": 57,
    "fp": 25,
    "fn": 27
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 5
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.6158,
    0.6958,
    0.8055,
    0.6965
   ],
   "meanAuc": 0.7034,
   "meanBalancedAcc": 0.6283,
   "meanF1": 0.8227,
   "confusionTotals": {
    "tp": 163,
    "tn": 29,
    "fp": 53,
    "fn": 17
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 10
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.6158,
    0.735,
    0.8055,
    0.6965
   ],
   "meanAuc": 0.7132,
   "meanBalancedAcc": 0.6453,
   "meanF1": 0.8289,
   "confusionTotals": {
    "tp": 163,
    "tn": 32,
    "fp": 50,
    "fn": 17
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 15
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.6095,
    0.7234,
    0.8055,
    0.7005
   ],
   "meanAuc": 0.7097,
   "meanBalancedAcc": 0.6453,
   "meanF1": 0.8289,
   "confusionTotals": {
    "tp": 163,
    "tn": 32,
    "fp": 50,
    "fn": 17
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 5
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7666,
    0.8694,
    0.9257,
    0.7485
   ],
   "meanAuc": 0.8275,
   "meanBalancedAcc": 0.6761,
   "meanF1": 0.8245,
   "confusionTotals": {
    "tp": 156,
    "tn": 40,
    "fp": 42,
    "fn": 24
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 10
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7553,
    0.8133,
    0.9257,
    0.7414
   ],
   "meanAuc": 0.8089,
   "meanBalancedAcc": 0.6795,
   "meanF1": 0.8199,
   "confusionTotals": {
    "tp": 153,
    "tn": 42,
    "fp": 40,
    "fn": 27
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 15
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7491,
    0.8191,
    0.9257,
    0.8348
   ],
   "meanAuc": 0.8322,
   "meanBalancedAcc": 0.6746,
   "meanF1": 0.8094,
   "confusionTotals": {
    "tp": 149,
    "tn": 43,
    "fp": 39,
    "fn": 31
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 5
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7416,
    0.8675,
    0.9483,
    0.7763
   ],
   "meanAuc": 0.8334,
   "meanBalancedAcc": 0.739,
   "meanF1": 0.8502,
   "confusionTotals": {
    "tp": 155,
    "tn": 51,
    "fp": 31,
    "fn": 25
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 10
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7416,
    0.8462,
    0.91,
    0.7798
   ],
   "meanAuc": 0.8194,
   "meanBalancedAcc": 0.7276,
   "meanF1": 0.8394,
   "confusionTotals": {
    "tp": 153,
    "tn": 50,
    "fp": 32,
    "fn": 27
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 15
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7309,
    0.8346,
    0.9396,
    0.8359
   ],
   "meanAuc": 0.8353,
   "meanBalancedAcc": 0.7197,
   "meanF1": 0.8273,
   "confusionTotals": {
    "tp": 150,
    "tn": 50,
    "fp": 32,
    "fn": 30
   }
  },
  {
   "candidate": "bagged-trees-forest",
   "hyper": {
    "nTrees": 60,
    "depth": 3,
    "minLeaf": 5,
    "seed": 20261114
   },
   "grouping": "4-fold group CV",
   "foldAucs": [
    0.7778,
    0.9352,
    0.957,
    0.8136
   ],
   "meanAuc": 0.8709,
   "meanBalancedAcc": 0.6603,
   "meanF1": 0.8577,
   "confusionTotals": {
    "tp": 175,
    "tn": 29,
    "fp": 53,
    "fn": 5
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.001
   },
   "grouping": "test-date group K=8 (secondary)",
   "foldAucs": [
    0.9234,
    0.838,
    0.684,
    0.9542,
    0.8529,
    0.9091,
    0.8929,
    0.9083
   ],
   "meanAuc": 0.8703,
   "meanBalancedAcc": 0.765,
   "meanF1": 0.7794,
   "confusionTotals": {
    "tp": 127,
    "tn": 69,
    "fp": 13,
    "fn": 53
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.1
   },
   "grouping": "test-date group K=8 (secondary)",
   "foldAucs": [
    0.9234,
    0.838,
    0.684,
    0.9542,
    0.8529,
    0.9091,
    0.8929,
    0.9083
   ],
   "meanAuc": 0.8703,
   "meanBalancedAcc": 0.765,
   "meanF1": 0.7794,
   "confusionTotals": {
    "tp": 127,
    "tn": 69,
    "fp": 13,
    "fn": 53
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 5
   },
   "grouping": "test-date group K=8 (secondary)",
   "foldAucs": [
    0.8541,
    0.7361,
    0.626,
    0.8813,
    0.8971,
    0.6486,
    0.8899,
    0.8875
   ],
   "meanAuc": 0.8026,
   "meanBalancedAcc": 0.7424,
   "meanF1": 0.8549,
   "confusionTotals": {
    "tp": 159,
    "tn": 50,
    "fp": 32,
    "fn": 21
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 10
   },
   "grouping": "test-date group K=8 (secondary)",
   "foldAucs": [
    0.933,
    0.7245,
    0.64,
    0.975,
    0.5858,
    0.7552,
    0.8363,
    0.8667
   ],
   "meanAuc": 0.7896,
   "meanBalancedAcc": 0.6678,
   "meanF1": 0.8163,
   "confusionTotals": {
    "tp": 158,
    "tn": 35,
    "fp": 47,
    "fn": 22
   }
  },
  {
   "candidate": "bagged-trees-forest",
   "hyper": {
    "nTrees": 60,
    "depth": 3,
    "minLeaf": 5
   },
   "grouping": "test-date group K=8 (secondary)",
   "foldAucs": [
    0.9522,
    0.713,
    0.41,
    0.9333,
    0.8235,
    0.9178,
    0.9077,
    0.9417
   ],
   "meanAuc": 0.8249,
   "meanBalancedAcc": 0.6684,
   "meanF1": 0.8544,
   "confusionTotals": {
    "tp": 176,
    "tn": 27,
    "fp": 55,
    "fn": 4
   }
  }
 ]
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ml/flex_extinction_experiment.json', '{
 "experiment_id": "M7-flex-extinction-20261114",
 "date": "2026-11-14",
 "task": "binary classification — FLEX droplet visible-flame extinction (Extinction vs Disruption/Completion)",
 "dataset": {
  "source": "data/experiments/Experiment_13_cleaned.csv (team cleaned package; canonical PSI-69 FLEX table, sha256-tracked)",
  "rowsRaw": 274,
  "rowsClean": 262,
  "positive": 180,
  "positiveShare": 0.687,
  "dropped": {
   "missingNumeric": 12,
   "badFuel": 0,
   "badOutcome": 0
  },
  "features": [
   "XO2",
   "p_mmHg",
   "d0_mm",
   "fuel_heptane",
   "XHe",
   "XCO"
  ],
  "featurePolicy": "pre-test conditions only; burning rate / burn time / extinction diameter excluded as outcome leakage"
 },
 "protocol": {
  "validation": "group-aware CV only — no random row splits",
  "primaryGrouping": "condition group (fuel, rounded pressure_mmHg, rounded XO2 to 2dp), K=4",
  "secondaryGrouping": "test-date group, K=8",
  "candidates": [
   "majority-class",
   "o2-only-baseline",
   "logistic-irls (ridge grid)",
   "knn-distance (k grid)",
   "cart-tree (depth×minLeaf grid)",
   "bagged-trees-forest (60 trees)"
  ],
  "seed": 20261114,
  "selectionPolicy": "replace registered champion only at >= +0.01 mean grouped AUC; ties prefer simpler interpretable model",
  "knownLimitations": [
   "hyperparameters evaluated on the same grouped CV used for reporting (no nested CV) — mild optimism; mitigated by group-bootstrap CI and the conservative replacement bar",
   "d0 rows with missing values dropped (v2-identical protocol); median-impute + missingness flag is a documented future variant",
   "Disruption and Completion merged as non-extinction — physically distinct outcomes (documented in the model card)"
  ]
 },
 "leaderboard": [
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.01
   },
   "meanAuc": 0.8714,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusion": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.001
   },
   "meanAuc": 0.8711,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusion": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.001
   },
   "meanAuc": 0.8711,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusion": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 0.1
   },
   "meanAuc": 0.8709,
   "meanBalancedAcc": 0.7863,
   "meanF1": 0.809,
   "confusion": {
    "tp": 130,
    "tn": 70,
    "fp": 12,
    "fn": 50
   }
  },
  {
   "candidate": "bagged-trees-forest",
   "hyper": {
    "nTrees": 60,
    "depth": 3,
    "minLeaf": 5,
    "seed": 20261114
   },
   "meanAuc": 0.8709,
   "meanBalancedAcc": 0.6603,
   "meanF1": 0.8577,
   "confusion": {
    "tp": 175,
    "tn": 29,
    "fp": 53,
    "fn": 5
   }
  },
  {
   "candidate": "logistic-irls",
   "hyper": {
    "ridge": 1
   },
   "meanAuc": 0.8703,
   "meanBalancedAcc": 0.789,
   "meanF1": 0.8128,
   "confusion": {
    "tp": 131,
    "tn": 70,
    "fp": 12,
    "fn": 49
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 9
   },
   "meanAuc": 0.8402,
   "meanBalancedAcc": 0.7731,
   "meanF1": 0.8581,
   "confusion": {
    "tp": 153,
    "tn": 57,
    "fp": 25,
    "fn": 27
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 7
   },
   "meanAuc": 0.8397,
   "meanBalancedAcc": 0.7791,
   "meanF1": 0.8606,
   "confusion": {
    "tp": 153,
    "tn": 58,
    "fp": 24,
    "fn": 27
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 5
   },
   "meanAuc": 0.8376,
   "meanBalancedAcc": 0.7735,
   "meanF1": 0.8585,
   "confusion": {
    "tp": 153,
    "tn": 57,
    "fp": 25,
    "fn": 27
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 15
   },
   "meanAuc": 0.8353,
   "meanBalancedAcc": 0.7197,
   "meanF1": 0.8273,
   "confusion": {
    "tp": 150,
    "tn": 50,
    "fp": 32,
    "fn": 30
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 5
   },
   "meanAuc": 0.8334,
   "meanBalancedAcc": 0.739,
   "meanF1": 0.8502,
   "confusion": {
    "tp": 155,
    "tn": 51,
    "fp": 31,
    "fn": 25
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 15
   },
   "meanAuc": 0.8322,
   "meanBalancedAcc": 0.6746,
   "meanF1": 0.8094,
   "confusion": {
    "tp": 149,
    "tn": 43,
    "fp": 39,
    "fn": 31
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 5
   },
   "meanAuc": 0.8275,
   "meanBalancedAcc": 0.6761,
   "meanF1": 0.8245,
   "confusion": {
    "tp": 156,
    "tn": 40,
    "fp": 42,
    "fn": 24
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 4,
    "minLeaf": 10
   },
   "meanAuc": 0.8194,
   "meanBalancedAcc": 0.7276,
   "meanF1": 0.8394,
   "confusion": {
    "tp": 153,
    "tn": 50,
    "fp": 32,
    "fn": 27
   }
  },
  {
   "candidate": "knn-distance",
   "hyper": {
    "k": 3
   },
   "meanAuc": 0.8188,
   "meanBalancedAcc": 0.7654,
   "meanF1": 0.8488,
   "confusion": {
    "tp": 150,
    "tn": 57,
    "fp": 25,
    "fn": 30
   }
  },
  {
   "candidate": "o2-only-baseline",
   "hyper": {
    "direction": "lower O2 -> extinction"
   },
   "meanAuc": 0.8139,
   "meanBalancedAcc": 0.5,
   "meanF1": 0,
   "confusion": {
    "tp": 0,
    "tn": 82,
    "fp": 0,
    "fn": 180
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 3,
    "minLeaf": 10
   },
   "meanAuc": 0.8089,
   "meanBalancedAcc": 0.6795,
   "meanF1": 0.8199,
   "confusion": {
    "tp": 153,
    "tn": 42,
    "fp": 40,
    "fn": 27
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 10
   },
   "meanAuc": 0.7132,
   "meanBalancedAcc": 0.6453,
   "meanF1": 0.8289,
   "confusion": {
    "tp": 163,
    "tn": 32,
    "fp": 50,
    "fn": 17
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 15
   },
   "meanAuc": 0.7097,
   "meanBalancedAcc": 0.6453,
   "meanF1": 0.8289,
   "confusion": {
    "tp": 163,
    "tn": 32,
    "fp": 50,
    "fn": 17
   }
  },
  {
   "candidate": "cart-tree",
   "hyper": {
    "depth": 2,
    "minLeaf": 5
   },
   "meanAuc": 0.7034,
   "meanBalancedAcc": 0.6283,
   "meanF1": 0.8227,
   "confusion": {
    "tp": 163,
    "tn": 29,
    "fp": 53,
    "fn": 17
   }
  },
  {
   "candidate": "majority-class",
   "hyper": {},
   "meanAuc": 0.5,
   "meanBalancedAcc": 0.5,
   "meanF1": 0.8142,
   "confusion": {
    "tp": 180,
    "tn": 0,
    "fp": 82,
    "fn": 0
   }
  }
 ],
 "championDecision": "RETAIN flex-extinction-v2 — best rival logistic-irls {\"ridge\":0.01} is +0.0003 AUC (below the +0.01 replacement bar)",
 "secondaryDateGroupedCV": {
  "logistic-irls {\"ridge\":0.001}": {
   "meanAuc": 0.8703,
   "folds": [
    0.9234,
    0.838,
    0.684,
    0.9542,
    0.8529,
    0.9091,
    0.8929,
    0.9083
   ]
  },
  "logistic-irls {\"ridge\":0.1}": {
   "meanAuc": 0.8703,
   "folds": [
    0.9234,
    0.838,
    0.684,
    0.9542,
    0.8529,
    0.9091,
    0.8929,
    0.9083
   ]
  },
  "knn-distance {\"k\":5}": {
   "meanAuc": 0.8026,
   "folds": [
    0.8541,
    0.7361,
    0.626,
    0.8813,
    0.8971,
    0.6486,
    0.8899,
    0.8875
   ]
  },
  "cart-tree {\"depth\":3,\"minLeaf\":10}": {
   "meanAuc": 0.7896,
   "folds": [
    0.933,
    0.7245,
    0.64,
    0.975,
    0.5858,
    0.7552,
    0.8363,
    0.8667
   ]
  },
  "bagged-trees-forest {\"nTrees\":60,\"depth\":3,\"minLeaf\":5}": {
   "meanAuc": 0.8249,
   "folds": [
    0.9522,
    0.713,
    0.41,
    0.9333,
    0.8235,
    0.9178,
    0.9077,
    0.9417
   ]
  }
 },
 "championGroupBootstrapCi": [
  0.8458,
  0.9362
 ],
 "artifactStatus": "updated with reverification (coefΔ=0.0001, aucΔ=0.0105)",
 "experimentLog": "data/ml/experiment_log.json"
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('models/flex-extinction/v2/model_card.json', '{
 "model_id": "flex-extinction-v2",
 "task": "binary classification — FLEX droplet visible-flame extinction outcome (Extinction vs Disruption/Completion)",
 "pillar": "suppression",
 "data": {
  "source": "PSI-69_FLEX.csv (NASA PSI, DOI 10.60555/mbq8-0451), recovered from official PSI endpoint, sha256-verified vs project manifest",
  "rows_raw": 274,
  "rows_clean": 262,
  "extinction": 180,
  "extinction_share": 0.687,
  "features": [
   "XO2",
   "p_mmHg",
   "d0_mm",
   "fuel_heptane",
   "XHe",
   "XCO"
  ],
  "outcome_definition": "y=1 if Test end == Extinction else 0 (Disruption/Completion)"
 },
 "validation": "GroupKFold n=4 grouped by (fuel, rounded pressure, rounded O2) condition",
 "metrics": {
  "groupedAucMean": 0.8816,
  "groupedAucFolds": [
   0.89,
   0.8462,
   0.8548,
   0.9354
  ],
  "balancedAccuracyMean": 0.7859,
  "oxygenOnlyBaselineAuc": 0.8175,
  "groupBootstrapAucCi": [
   0.8819,
   0.889
  ]
 },
 "historical_recorded": {
  "note": "Metrics recorded in the V6 project spec from the prior repository build (protocol/grouping not fully preserved)",
  "groupedAuc": 0.875,
  "groupedAucCi": [
   0.832,
   0.917
  ],
  "oxygenOnlyBaselineAuc": 0.806,
  "balancedAccuracy": 0.77,
  "nClean": 261,
  "extinctionShare": 0.686,
  "conditionGroups": 110
 },
 "inBrowserScoring": {
  "kind": "logistic",
  "featureNames": [
   "XO2",
   "p_mmHg",
   "d0_mm",
   "fuel_heptane",
   "XHe",
   "XCO"
  ],
  "means": [
   0.20103,
   716.22023,
   3.00168,
   0.41221,
   0.04809,
   0.12424
  ],
  "stds": [
   0.04728,
   280.23267,
   0.69402,
   0.49223,
   0.11298,
   0.17629
  ],
  "coefStandardized": [
   -1.86949,
   -0.02345,
   0.69001,
   -0.40755,
   0.41666,
   0.34051
  ],
  "score": "sigmoid(coef . ((x - means)/stds))"
 },
 "limitations": [
  "Outcome is visible-flame extinction in the FLEX droplet configuration only; not a general flammability or cabin-fire safety metric.",
  "Applicability domain: microgravity ISS FLEX conditions (methanol/heptane droplets, ~0.21-0.65 O2, ~500-1100 mmHg). Model guard rejects gravity > 0.02 g.",
  "Not calibrated as a probability; report as relative score with uncertainty.",
  "Small sample; grouped CV fold variance is material.",
  "Disruption and Completion outcomes are merged as non-extinction; they are physically distinct."
 ],
 "trainedAt": "2026-11-12",
 "framework": "custom IRLS logistic regression (numpy), reproduced in this rebuild",
 "status": "verified-reproduction",
 "domainGuard": {
  "maxGravityG": 0.02,
  "fuels": [
   "Methanol",
   "Heptane"
  ],
  "o2Range": [
   0.15,
   0.7
  ],
  "pressureMmHgRange": [
   400,
   1150
  ]
 },
 "reverification": {
  "date": "2026-11-14",
  "protocol": "M7 multi-candidate experiment (scripts/flame/ml-flex-extinction-experiment.mjs), same data file Experiment_13_cleaned.csv",
  "reproductionCheck": {
   "coefMaxAbsDelta": 0.0001,
   "groupedAucDelta": 0.0105,
   "reproducedMeanAuc": 0.8711,
   "reproducedFolds": [
    0.7872,
    0.8868,
    0.971,
    0.8394
   ],
   "registeredMeanAuc": 0.8816,
   "pass": true
  },
  "candidateComparison": {
   "leaderboard": [
    {
     "candidate": "logistic-irls",
     "hyper": {
      "ridge": 0.01
     },
     "meanAuc": 0.8714,
     "meanBalancedAcc": 0.7863,
     "meanF1": 0.809,
     "confusion": {
      "tp": 130,
      "tn": 70,
      "fp": 12,
      "fn": 50
     }
    },
    {
     "candidate": "logistic-irls",
     "hyper": {
      "ridge": 0.001
     },
     "meanAuc": 0.8711,
     "meanBalancedAcc": 0.7863,
     "meanF1": 0.809,
     "confusion": {
      "tp": 130,
      "tn": 70,
      "fp": 12,
      "fn": 50
     }
    },
    {
     "candidate": "logistic-irls",
     "hyper": {
      "ridge": 0.001
     },
     "meanAuc": 0.8711,
     "meanBalancedAcc": 0.7863,
     "meanF1": 0.809,
     "confusion": {
      "tp": 130,
      "tn": 70,
      "fp": 12,
      "fn": 50
     }
    },
    {
     "candidate": "logistic-irls",
     "hyper": {
      "ridge": 0.1
     },
     "meanAuc": 0.8709,
     "meanBalancedAcc": 0.7863,
     "meanF1": 0.809,
     "confusion": {
      "tp": 130,
      "tn": 70,
      "fp": 12,
      "fn": 50
     }
    },
    {
     "candidate": "bagged-trees-forest",
     "hyper": {
      "nTrees": 60,
      "depth": 3,
      "minLeaf": 5,
      "seed": 20261114
     },
     "meanAuc": 0.8709,
     "meanBalancedAcc": 0.6603,
     "meanF1": 0.8577,
     "confusion": {
      "tp": 175,
      "tn": 29,
      "fp": 53,
      "fn": 5
     }
    },
    {
     "candidate": "logistic-irls",
     "hyper": {
      "ridge": 1
     },
     "meanAuc": 0.8703,
     "meanBalancedAcc": 0.789,
     "meanF1": 0.8128,
     "confusion": {
      "tp": 131,
      "tn": 70,
      "fp": 12,
      "fn": 49
     }
    },
    {
     "candidate": "knn-distance",
     "hyper": {
      "k": 9
     },
     "meanAuc": 0.8402,
     "meanBalancedAcc": 0.7731,
     "meanF1": 0.8581,
     "confusion": {
      "tp": 153,
      "tn": 57,
      "fp": 25,
      "fn": 27
     }
    },
    {
     "candidate": "knn-distance",
     "hyper": {
      "k": 7
     },
     "meanAuc": 0.8397,
     "meanBalancedAcc": 0.7791,
     "meanF1": 0.8606,
     "confusion": {
      "tp": 153,
      "tn": 58,
      "fp": 24,
      "fn": 27
     }
    },
    {
     "candidate": "knn-distance",
     "hyper": {
      "k": 5
     },
     "meanAuc": 0.8376,
     "meanBalancedAcc": 0.7735,
     "meanF1": 0.8585,
     "confusion": {
      "tp": 153,
      "tn": 57,
      "fp": 25,
      "fn": 27
     }
    },
    {
     "candidate": "cart-tree",
     "hyper": {
      "depth": 4,
      "minLeaf": 15
     },
     "meanAuc": 0.8353,
     "meanBalancedAcc": 0.7197,
     "meanF1": 0.8273,
     "confusion": {
      "tp": 150,
      "tn": 50,
      "fp": 32,
      "fn": 30
     }
    },
    {
     "candidate": "cart-tree",
     "hyper": {
      "depth": 4,
      "minLeaf": 5
     },
     "meanAuc": 0.8334,
     "meanBalancedAcc": 0.739,
     "meanF1": 0.8502,
     "confusion": {
      "tp": 155,
      "tn": 51,
      "fp": 31,
      "fn": 25
     }
    },
    {
     "candidate": "cart-tree",
     "hyper": {
      "depth": 3,
      "minLeaf": 15
     },
     "meanAuc": 0.8322,
     "meanBalancedAcc": 0.6746,
     "meanF1": 0.8094,
     "confusion": {
      "tp": 149,
      "tn": 43,
      "fp": 39,
      "fn": 31
     }
    }
   ],
   "decision": "RETAIN flex-extinction-v2 — best rival logistic-irls {\"ridge\":0.01} is +0.0003 AUC (below the +0.01 replacement bar)"
  },
  "secondaryDateGroupedCV": {
   "logistic-irls {\"ridge\":0.001}": {
    "meanAuc": 0.8703,
    "folds": [
     0.9234,
     0.838,
     0.684,
     0.9542,
     0.8529,
     0.9091,
     0.8929,
     0.9083
    ]
   },
   "logistic-irls {\"ridge\":0.1}": {
    "meanAuc": 0.8703,
    "folds": [
     0.9234,
     0.838,
     0.684,
     0.9542,
     0.8529,
     0.9091,
     0.8929,
     0.9083
    ]
   },
   "knn-distance {\"k\":5}": {
    "meanAuc": 0.8026,
    "folds": [
     0.8541,
     0.7361,
     0.626,
     0.8813,
     0.8971,
     0.6486,
     0.8899,
     0.8875
    ]
   },
   "cart-tree {\"depth\":3,\"minLeaf\":10}": {
    "meanAuc": 0.7896,
    "folds": [
     0.933,
     0.7245,
     0.64,
     0.975,
     0.5858,
     0.7552,
     0.8363,
     0.8667
    ]
   },
   "bagged-trees-forest {\"nTrees\":60,\"depth\":3,\"minLeaf\":5}": {
    "meanAuc": 0.8249,
    "folds": [
     0.9522,
     0.713,
     0.41,
     0.9333,
     0.8235,
     0.9178,
     0.9077,
     0.9417
    ]
   }
  },
  "championGroupBootstrapCi": [
   0.8458,
   0.9362
  ],
  "experimentLog": "data/ml/experiment_log.json",
  "experimentSummary": "data/ml/flex_extinction_experiment.json"
 }
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261112-001.json', '{
  "batchId": "B-20261112-001",
  "receivedAt": "2026-11-12T16:58:22.040Z",
  "fileCount": 1,
  "files": [
    {
      "id": "f001",
      "name": "test-upload.csv",
      "sizeBytes": 362,
      "sha256": "bbd16bb7a7f17fbf52ca7d55891a13652927a4c5d1a902c7c9f039ab12603e8a",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 227,
        "headings": [
          "test-upload.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-001/f001-test-upload.txt"
      },
      "tables": [
        {
          "name": "test-upload",
          "columns": [
            "Sample (Fuel Type)",
            "Initial Droplet Diameter (mm)",
            "Ambient Gas Mixture",
            "Oxygen Mole Fraction",
            "Ambient Pressure (atm)",
            "Ambient Temperature (C)",
            "Flow Velocity (cm/s)"
          ],
          "rowCount": 2,
          "sample": [
            {
              "Sample (Fuel Type)": "IsoOctane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            },
            {
              "Sample (Fuel Type)": "n-Octane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fuel-octane",
          "entityLabel": "n-Octane",
          "entityType": "fuel",
          "source": "test-upload.csv",
          "location": "document body",
          "context": "17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 n-Octane (pure),1.5 - 5,O2/N2 or O2/He,0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Sample (Fuel Type),Initial Droplet Diameter (mm),Ambient Gas Mixture ,Oxygen Mole Fraction,Ambient Pressure (atm), Ambient Temperature (C),Flow Velocity (cm/s)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-001/f001-test-upload.csv",
      "extractedPath": "data/extracted/batches/B-20261112-001/f001.extract.json",
      "processingMs": 21
    }
  ],
  "totals": {
    "files": 1,
    "extracted": 1,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 1,
    "pages": 0,
    "chars": 227,
    "tables": 1,
    "tableRows": 2,
    "equations": 0,
    "figures": 0,
    "entities": 1,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 1,
    "files": 1,
    "uniqueFiles": 1,
    "duplicateFiles": 0,
    "documents": 1,
    "pages": 0,
    "chars": 227,
    "tables": 1,
    "tableRows": 2,
    "equations": 0,
    "figures": 0,
    "mediaAssets": 0,
    "entities": 109,
    "errors": 0,
    "userConfirmedAllUploads": false,
    "lastBatchId": "B-20261112-001",
    "updatedAt": "2026-11-12T16:58:22.073Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261112-002.json', '{
  "batchId": "B-20261112-002",
  "receivedAt": "2026-11-12T20:27:06.375Z",
  "fileCount": 10,
  "files": [
    {
      "id": "f001",
      "name": "PSI-100_Experimental table_SAFFIRE-3.csv",
      "sizeBytes": 239,
      "sha256": "4d3c717ec20dd0247db670b2784a9fd7d746788bc54a936f80693e48eb8cd117",
      "kind": "csv",
      "status": "extracted",
      "domain": "data",
      "text": {
        "chars": 200,
        "headings": [
          "PSI-100_Experimental table_SAFFIRE-3.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f001-PSI-100_Experimental table_SAFFIRE-3.txt"
      },
      "tables": [
        {
          "name": "PSI-100_Experimental table_SAFFIRE-3",
          "columns": [
            "Sample Number",
            "Material",
            "Sample Thickness",
            "Sample Length",
            "Sample Width",
            "Air Flow",
            "Direction",
            "Camera 1",
            "Camera 2"
          ],
          "rowCount": 2,
          "sample": [
            {
              "Sample Number": "S1",
              "Material": "SIBAL Fabric",
              "Sample Thickness": ".33 cm",
              "Sample Length": "94 cm",
              "Sample Width": "40.6 cm",
              "Air Flow": "30 cm/s",
              "Direction": "Concurrent",
              "Camera 1": "S1C1",
              "Camera 2": "S1C2"
            },
            {
              "Sample Number": "S2",
              "Material": "SIBAL Fabric",
              "Sample Thickness": ".33 cm",
              "Sample Length": "94 cm",
              "Sample Width": "40.6 cm",
              "Air Flow": "30 cm/s",
              "Direction": "Opposed",
              "Camera 1": "S2C1",
              "Camera 2": "S2C2"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-100_Experimental table_SAFFIRE-3.csv",
          "location": "document body",
          "context": "ple Thickness,Sample Length,Sample Width,Air Flow ,Direction,Camera 1,Camera 2 S1,SIBAL Fabric,.33 cm,94 cm,40.6 cm,30 cm/s,Concurrent ,S1C1,S1C2 S2,SIBAL Fab",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-100_Experimental table_SAFFIRE-3.csv",
          "location": "document body",
          "context": "ength,Sample Width,Air Flow ,Direction,Camera 1,Camera 2 S1,SIBAL Fabric,.33 cm,94 cm,40.6 cm,30 cm/s,Concurrent ,S1C1,S1C2 S2,SIBAL Fabric,.33 cm,94 cm,40.6",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Sample Number ,Material,Sample Thickness,Sample Length,Sample Width,Air Flow ,Direction,Camera 1,Camera 2",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f001-PSI-100_Experimental table_SAFFIRE-3.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f001.extract.json",
      "processingMs": 14
    },
    {
      "id": "f002",
      "name": "PSI-101_Experimental table_SAME-R.csv",
      "sizeBytes": 5674,
      "sha256": "87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef",
      "kind": "csv",
      "status": "extracted",
      "domain": "data",
      "text": {
        "chars": 253,
        "headings": [
          "PSI-101_Experimental table_SAME-R.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f002-PSI-101_Experimental table_SAME-R.txt"
      },
      "tables": [
        {
          "name": "PSI-101_Experimental table_SAME-R",
          "columns": [
            "Sample Type",
            "SAME Test #",
            "Description",
            "Date",
            "Inlet velocity (cm/s)",
            "Rt/R0",
            "Duration (sec)",
            "Primary aging time (sec)",
            "Primary mixing time (sec)",
            "Net aging time (sec)"
          ],
          "rowCount": 109,
          "sample": [
            {
              "Sample Type": "Kapton",
              "SAME Test #": 51,
              "Description": "B.L. new formula",
              "Date": "21-Jul",
              "Inlet velocity (cm/s)": 8.1,
              "Rt/R0": 1.38,
              "Duration (sec)": 60,
              "Primary aging time (sec)": 11,
              "Primary mixing time (sec)": 8,
              "Net aging time (sec)": 38
            },
            {
              "Sample Type": "Kapton",
              "SAME Test #": "51a",
              "Description": "B.L. new formula",
              "Date": "22-Jul",
              "Inlet velocity (cm/s)": 8.1,
              "Rt/R0": 1.38,
              "Duration (sec)": 60,
              "Primary aging time (sec)": null,
              "Primary mixing time (sec)": null,
              "Net aging time (sec)": 261
            },
            {
              "Sample Type": "Kapton",
              "SAME Test #": 61,
              "Description": "Baseline Aging",
              "Date": "2-Aug",
              "Inlet velocity (cm/s)": 8.1,
              "Rt/R0": 1.38,
              "Duration (sec)": 60,
              "Primary aging time (sec)": 11,
              "Primary mixing time (sec)": 8,
              "Net aging time (sec)": 38
            },
            {
              "Sample Type": "Kapton",
              "SAME Test #": "61a",
              "Description": "aged",
              "Date": "2-Aug",
              "Inlet velocity (cm/s)": 8.1,
              "Rt/R0": 1.38,
              "Duration (sec)": null,
              "Primary aging time (sec)": null,
              "Primary mixing time (sec)": null,
              "Net aging time (sec)": 807
            },
            {
              "Sample Type": "Kapton",
              "SAME Test #": 62,
              "Description": "High Temp aging",
              "Date": "2-Aug",
              "Inlet velocity (cm/s)": 8.1,
              "Rt/R0": 1.48,
              "Duration (sec)": 60,
              "Primary aging time (sec)": 11,
              "Primary mixing time (sec)": 8,
              "Net aging time (sec)": 39
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [],
      "publication": {
        "title": "Sample Type,SAME Test #,Description,Date,Inlet velocity (cm/s),Rt/R0,Duration (sec),Primary aging time (sec),Primary mixing time (sec),Net aging time (sec)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f002-PSI-101_Experimental table_SAME-R.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f002.extract.json",
      "processingMs": 9
    },
    {
      "id": "f003",
      "name": "PSI-102_Experimental table_SAME.csv",
      "sizeBytes": 331,
      "sha256": "268d1e121d2f211b124407dd32b9475617bd269ede2c2d1749441da3e949a2af",
      "kind": "csv",
      "status": "extracted",
      "domain": "materials",
      "text": {
        "chars": 179,
        "headings": [
          "PSI-102_Experimental table_SAME.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f003-PSI-102_Experimental table_SAME.txt"
      },
      "tables": [
        {
          "name": "PSI-102_Experimental table_SAME",
          "columns": [
            "Sample #",
            "Sample Material",
            "Air Flow (cm/s)",
            "Weight loss rate (mg/min)",
            "Aging Duration (minutes)"
          ],
          "rowCount": 8,
          "sample": [
            {
              "Sample #": 1,
              "Sample Material": "Teflon",
              "Air Flow (cm/s)": 5,
              "Weight loss rate (mg/min)": 2,
              "Aging Duration (minutes)": 1
            },
            {
              "Sample #": 2,
              "Sample Material": "Teflon",
              "Air Flow (cm/s)": 5,
              "Weight loss rate (mg/min)": 1,
              "Aging Duration (minutes)": 1
            },
            {
              "Sample #": 3,
              "Sample Material": "Teflon",
              "Air Flow (cm/s)": 5,
              "Weight loss rate (mg/min)": 2,
              "Aging Duration (minutes)": 20
            },
            {
              "Sample #": 4,
              "Sample Material": "Teflon",
              "Air Flow (cm/s)": 10,
              "Weight loss rate (mg/min)": 2,
              "Aging Duration (minutes)": 1
            },
            {
              "Sample #": 5,
              "Sample Material": "Kapton: same conditions as 1-4",
              "Air Flow (cm/s)": null,
              "Weight loss rate (mg/min)": null,
              "Aging Duration (minutes)": null
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [],
      "publication": {
        "title": "Sample #,Sample Material  ,Air Flow (cm/s),Weight loss rate (mg/min),Aging Duration (minutes)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f003-PSI-102_Experimental table_SAME.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f003.extract.json",
      "processingMs": 3
    },
    {
      "id": "f004",
      "name": "PSI-106_Experimental table_Slice.csv",
      "sizeBytes": 734,
      "sha256": "89ef980810ca6d9aa8be817b42e36cd2adff23f5e9058361b5a33d18b4363f4d",
      "kind": "csv",
      "status": "extracted",
      "domain": "data",
      "text": {
        "chars": 106,
        "headings": [
          "PSI-106_Experimental table_Slice.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f004-PSI-106_Experimental table_Slice.txt"
      },
      "tables": [
        {
          "name": "PSI-106_Experimental table_Slice",
          "columns": [
            "Test Date",
            "Fuel Type"
          ],
          "rowCount": 12,
          "sample": [
            {
              "Test Date": "2012-FEB-09",
              "Fuel Type": "100% CH4"
            },
            {
              "Test Date": "2012-FEB-13 SLICE testing with",
              "Fuel Type": "40% CH4 (balance N2) including 2 pyrometry calibration tests and 2 fan calibrations"
            },
            {
              "Test Date": "2012-FEB-17",
              "Fuel Type": "70% CH4 (balance N2) including 1 pyrometry calibration test"
            },
            {
              "Test Date": "2012-FEB-20",
              "Fuel Type": "20% C2H4 (balance N2)"
            },
            {
              "Test Date": "2012-FEB-27",
              "Fuel Type": "100% CH4"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-spice",
          "entityLabel": "SPICE",
          "entityType": "investigation",
          "source": "PSI-106_Experimental table_Slice.csv",
          "location": "document body",
          "context": "est and 2 fan calibrations 2012-MAR-23 Last day of testing: SPICE testing with 100% C3H8 and then 100%,100% C2H4",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-slice",
          "entityLabel": "SLICE",
          "entityType": "investigation",
          "source": "PSI-106_Experimental table_Slice.csv",
          "location": "document body",
          "context": "Test Date,Fuel Type 2012-FEB-09,100% CH4 2012-FEB-13 SLICE testing with ,40% CH4 (balance N2) including 2 pyrometry calibration tests and 2 fan calibrat",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-106_Experimental table_Slice.csv",
          "location": "document body",
          "context": "ns 2012-MAR-23 Last day of testing: SPICE testing with 100% C3H8 and then 100%,100% C2H4",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-106_Experimental table_Slice.csv",
          "location": "document body",
          "context": "Test Date,Fuel Type 2012-FEB-09,100% CH4 2012-FEB-13 SLICE testing with ,40% CH4 (balance N2) including 2 pyrometry calibration tests a",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Test Date,Fuel Type",
        "titleConfidence": "medium",
        "years": [
          2012
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f004-PSI-106_Experimental table_Slice.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f004.extract.json",
      "processingMs": 4
    },
    {
      "id": "f005",
      "name": "PSI-107_Experimental table_Spice.csv",
      "sizeBytes": 31205,
      "sha256": "fb0d7e60cf5367afb429089e9901d27288f78038efd26c8de1db4fbe04117136",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 218,
        "headings": [
          "PSI-107_Experimental table_Spice.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f005-PSI-107_Experimental table_Spice.txt"
      },
      "tables": [
        {
          "name": "PSI-107_Experimental table_Spice",
          "columns": [
            "GMT date",
            "GMT ignition",
            "GMT  Flame Off",
            "Fuel",
            "Nozzle (mm)",
            "Fuel Rate (sccm)",
            "Fuel Rate (mg/s)",
            "HC Fuel Rate (mg/s)",
            "Air Rate (cm/s)"
          ],
          "rowCount": 469,
          "sample": [
            {
              "GMT date": 45,
              "GMT ignition": "14:37:08",
              "GMT  Flame Off": "14:48:03",
              "Fuel": "Ethylene",
              "Nozzle (mm)": 1.6002,
              "Fuel Rate (sccm)": 103.8,
              "Fuel Rate (mg/s)": 1.971,
              "HC Fuel Rate (mg/s)": 1.971,
              "Air Rate (cm/s)": 36.39
            },
            {
              "GMT date": 45,
              "GMT ignition": "14:37:08",
              "GMT  Flame Off": "14:48:03",
              "Fuel": "Ethylene",
              "Nozzle (mm)": 1.6002,
              "Fuel Rate (sccm)": 103.8,
              "Fuel Rate (mg/s)": 1.971,
              "HC Fuel Rate (mg/s)": 1.971,
              "Air Rate (cm/s)": 36.39
            },
            {
              "GMT date": 45,
              "GMT ignition": "14:50:07",
              "GMT  Flame Off": "14:52:11",
              "Fuel": "Ethylene",
              "Nozzle (mm)": 1.6002,
              "Fuel Rate (sccm)": 51,
              "Fuel Rate (mg/s)": 0.968,
              "HC Fuel Rate (mg/s)": 0.968,
              "Air Rate (cm/s)": 40.15
            },
            {
              "GMT date": 45,
              "GMT ignition": "14:50:07",
              "GMT  Flame Off": "14:52:11",
              "Fuel": "Ethylene",
              "Nozzle (mm)": 1.6002,
              "Fuel Rate (sccm)": 51.6,
              "Fuel Rate (mg/s)": 0.98,
              "HC Fuel Rate (mg/s)": 0.98,
              "Air Rate (cm/s)": 40.15
            },
            {
              "GMT date": 45,
              "GMT ignition": "15:35:44",
              "GMT  Flame Off": "15:37:00",
              "Fuel": "Ethylene",
              "Nozzle (mm)": 1.6002,
              "Fuel Rate (sccm)": 138,
              "Fuel Rate (mg/s)": 2.62,
              "HC Fuel Rate (mg/s)": 2.62,
              "Air Rate (cm/s)": 57.08
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-107_Experimental table_Spice.csv",
          "location": "document body",
          "context": "Ethylene,0.4064,88.8,1.686,1.686,15.71 48,16:53:44,16:55:09,Propane,1.6002,92.52,2.761,2.761,42.97 48,16.53.45,16.55.09,Propane,1.6002,,,0, 48,17:01:35,17:03",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-107_Experimental table_Spice.csv",
          "location": "document body",
          "context": "thylene,1.6002,138.6,2.631,2.631,55.2 168,10:42:48,10:45:01,Methane,0.4064,51.12,0.555,0.555,27.93 168,11:16:48,11:18:15,Methane,0.4064,41.04,0.446,0.446,32.6",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "GMT date,GMT ignition,GMT  Flame Off ,Fuel,Nozzle (mm),Fuel Rate (sccm),Fuel Rate (mg/s),HC Fuel Rate (mg/s),Air Rate (cm/s)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f005-PSI-107_Experimental table_Spice.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f005.extract.json",
      "processingMs": 8
    },
    {
      "id": "f006",
      "name": "PSI-10_Experimental table_Flame Design_Inverse Flame.csv",
      "sizeBytes": 17314,
      "sha256": "97933ee9ae0b9ebc6b948a67485a0fe2f8218f753253a4f2be93c40d374c44e4",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 258,
        "headings": [
          "PSI-10_Experimental table_Flame Design_Inverse Flame.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f006-PSI-10_Experimental table_Flame Design_Inverse Flame.txt"
      },
      "tables": [
        {
          "name": "PSI-10_Experimental table_Flame Design_Inverse Flame",
          "columns": [
            "Flame Type",
            "Day",
            "Test",
            "XO2",
            "mO2 (mg/s)",
            "mN2 (mg/s)",
            "mtot (mg/s)",
            "XC2H4 initial",
            "XC2H4 final",
            "pinit (atm)",
            "pfinal (atm)",
            "pmean (atm)",
            "mean Zst",
            "Tad (K)"
          ],
          "rowCount": 120,
          "sample": [
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Test": "21328A1",
              "XO2": 0.37082819,
              "mO2 (mg/s)": 5.116084436,
              "mN2 (mg/s)": 7.599363286,
              "mtot (mg/s)": 12.71544772,
              "XC2H4 initial": 0.271563399,
              "XC2H4 final": 0.270262846,
              "pinit (atm)": 0.99823482,
              "pfinal (atm)": 1.00980264,
              "pmean (atm)": 1.00401873,
              "mean Zst": 0.302316402,
              "Tad (K)": 2595.073097
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Test": "21328A2",
              "XO2": 0.371286026,
              "mO2 (mg/s)": 5.116388106,
              "mN2 (mg/s)": 7.584919544,
              "mtot (mg/s)": 12.70130765,
              "XC2H4 initial": 0.270262846,
              "XC2H4 final": 0.26916346,
              "pinit (atm)": 1.00163712,
              "pfinal (atm)": 1.0138854,
              "pmean (atm)": 1.00776126,
              "mean Zst": 0.30350118,
              "Tad (K)": 2594.870605
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Test": "21328D1",
              "XO2": 0.212319452,
              "mO2 (mg/s)": 2.367048277,
              "mN2 (mg/s)": 7.687948069,
              "mtot (mg/s)": 10.05499635,
              "XC2H4 initial": 0.26916346,
              "XC2H4 final": 0.24285623,
              "pinit (atm)": 1.0036785,
              "pfinal (atm)": 1.09281876,
              "pmean (atm)": 1.04824863,
              "mean Zst": 0.211548493,
              "Tad (K)": 2192.217132
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Test": "21328N1",
              "XO2": 0.849977932,
              "mO2 (mg/s)": 9.799337625,
              "mN2 (mg/s)": 1.514213825,
              "mtot (mg/s)": 11.31355145,
              "XC2H4 initial": 0.082213121,
              "XC2H4 final": 0.081614867,
              "pinit (atm)": 0.9492417,
              "pfinal (atm)": 0.96080952,
              "pmean (atm)": 0.95502561,
              "mean Zst": 0.755160549,
              "Tad (K)": 2335.819318
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Test": "21328N2",
              "XO2": 0.849977932,
              "mO2 (mg/s)": 7.987785467,
              "mN2 (mg/s)": 1.234289056,
              "mtot (mg/s)": 9.222074523,
              "XC2H4 initial": 0.081614867,
              "XC2H4 final": 0.081198911,
              "pinit (atm)": 0.95060262,
              "pfinal (atm)": 0.9594486,
              "pmean (atm)": 0.95502561,
              "mean Zst": 0.756306904,
              "Tad (K)": 2330.954842
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [],
      "publication": {
        "title": "Flame Type,Day,Test,XO2,mO2 (mg/s),mN2 (mg/s),mtot (mg/s),XC2H4 initial,XC2H4 final,pinit (atm),pfinal (atm),pmean (atm),mean Zst,Tad (K)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f006-PSI-10_Experimental table_Flame Design_Inverse Flame.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f006.extract.json",
      "processingMs": 6
    },
    {
      "id": "f007",
      "name": "PSI-10_Experimental table_Flame Design_Normal Flame.csv",
      "sizeBytes": 26933,
      "sha256": "4a663292bd3f65201943cc71bd661a70383639276a9176f64105b285bf0b6deb",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 264,
        "headings": [
          "PSI-10_Experimental table_Flame Design_Normal Flame.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f007-PSI-10_Experimental table_Flame Design_Normal Flame.txt"
      },
      "tables": [
        {
          "name": "PSI-10_Experimental table_Flame Design_Normal Flame",
          "columns": [
            "Flame Type",
            "Day",
            "Fuel",
            "Test",
            "Xfuel",
            "mfuel (mg/s)",
            "mN2 (mg/s)",
            "mtot (mg/s)",
            "XO2 (init)",
            "XO2 (final)",
            "pinit (atm)",
            "pfinal (atm)",
            "pmean (atm)",
            "mean Zst",
            "Tad (K)"
          ],
          "rowCount": 207,
          "sample": [
            {
              "Flame Type": "Normal",
              "Day": 0,
              "Fuel": "C2H4",
              "Test": "19115A1",
              "Xfuel": 1,
              "mfuel (mg/s)": 0.968953877,
              "mN2 (mg/s)": 0,
              "mtot (mg/s)": 0.968953877,
              "XO2 (init)": 0.207128374,
              "XO2 (final)": 0.206202891,
              "pinit (atm)": 1.01184402,
              "pfinal (atm)": 1.0240923,
              "pmean (atm)": 1.01796816,
              "mean Zst": 0.062716477,
              "Tad (K)": 2352.144414
            },
            {
              "Flame Type": "Normal",
              "Day": 0,
              "Fuel": "C2H4",
              "Test": "19115D2",
              "Xfuel": "RAMPED",
              "mfuel (mg/s)": "RAMPED",
              "mN2 (mg/s)": "RAMPED",
              "mtot (mg/s)": "RAMPED",
              "XO2 (init)": 0.206169206,
              "XO2 (final)": 0.205663073,
              "pinit (atm)": 1.01320494,
              "pfinal (atm)": 1.01932908,
              "pmean (atm)": 1.01626701,
              "mean Zst": "RAMPED",
              "Tad (K)": "RAMPED"
            },
            {
              "Flame Type": "Normal",
              "Day": 0,
              "Fuel": "C2H4",
              "Test": "19115B1",
              "Xfuel": 1,
              "mfuel (mg/s)": 0.639804819,
              "mN2 (mg/s)": 0,
              "mtot (mg/s)": 0.639804819,
              "XO2 (init)": 0.205663073,
              "XO2 (final)": 0.204951718,
              "pinit (atm)": 1.0138854,
              "pfinal (atm)": 1.02069,
              "pmean (atm)": 1.0172877,
              "mean Zst": 0.062341004,
              "Tad (K)": 2345.932123
            },
            {
              "Flame Type": "Normal",
              "Day": 0,
              "Fuel": "C2H4",
              "Test": "19115B2",
              "Xfuel": "RAMPED",
              "mfuel (mg/s)": "RAMPED",
              "mN2 (mg/s)": "RAMPED",
              "mtot (mg/s)": "RAMPED",
              "XO2 (init)": 0.204939076,
              "XO2 (final)": 0.20431758,
              "pinit (atm)": 1.01320494,
              "pfinal (atm)": 1.02000954,
              "pmean (atm)": 1.01660724,
              "mean Zst": "RAMPED",
              "Tad (K)": "RAMPED"
            },
            {
              "Flame Type": "Normal",
              "Day": 0,
              "Fuel": "C2H4",
              "Test": "19115F1",
              "Xfuel": 0.292030339,
              "mfuel (mg/s)": 0.638036948,
              "mN2 (mg/s)": 1.545139763,
              "mtot (mg/s)": 2.183176711,
              "XO2 (init)": 0.20431758,
              "XO2 (final)": 0.203863566,
              "pinit (atm)": 1.0138854,
              "pfinal (atm)": 1.01932908,
              "pmean (atm)": 1.01660724,
              "mean Zst": 0.184576296,
              "Tad (K)": 2186.108871
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-10_Experimental table_Flame Design_Normal Flame.csv",
          "location": "document body",
          "context": "7475265,1.01184402,1.0172877,1.01456586,RAMP,RAMP Normal,13,C3H8,21301A1,1,1.2,0,1.2,0.4,,0.931972789,,,0.106461571,2734.953406 Normal,13,C3H8,21301A2,1,1.2,0",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Flame Type,Day,Fuel,Test,Xfuel,mfuel (mg/s),mN2 (mg/s),mtot (mg/s),XO2 (init),XO2 (final),pinit (atm),pfinal (atm),pmean (atm),mean Zst,Tad (K)",
        "titleConfidence": "medium",
        "years": [
          2003,
          2006,
          2016
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f007-PSI-10_Experimental table_Flame Design_Normal Flame.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f007.extract.json",
      "processingMs": 9
    },
    {
      "id": "f008",
      "name": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
      "sizeBytes": 39422,
      "sha256": "d4d44f8b9896936728748e34d1b6ad0812032a92fa5289599b708c138e3a9b39",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 360,
        "headings": [
          "PSI-159_Experimental table_CFI-G_Inverse Flames.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f008-PSI-159_Experimental table_CFI-G_Inverse Flames.txt"
      },
      "tables": [
        {
          "name": "PSI-159_Experimental table_CFI-G_Inverse Flames",
          "columns": [
            "Flame Type",
            "Day",
            "Fuel",
            "Test",
            "Xf  before test",
            "Xf  after test",
            "approx p (bar)",
            "XO2",
            "HC burnrate (mg/s)",
            "O2 flow rate (mg/s)",
            "TFP",
            "Tad (K)",
            "Zst",
            "Hot ignition",
            "burn time (sec)",
            "Self -ext or flow term",
            "Peak burner Temp (C)",
            "Peak burner temp (K)",
            "Color",
            "Comments"
          ],
          "rowCount": 154,
          "sample": [
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21196 A1",
              "Xf  before test": 0.2981,
              "Xf  after test": 0.2981,
              "approx p (bar)": 1.1,
              "XO2": 0.21,
              "HC burnrate (mg/s)": 1.5,
              "O2 flow rate (mg/s)": 5.59,
              "TFP": "No",
              "Tad (K)": 2120,
              "Zst": 0.1665,
              "Hot ignition": "No",
              "burn time (sec)": 0,
              "Self -ext or flow term": "-",
              "Peak burner Temp (C)": 27.1,
              "Peak burner temp (K)": 300.25,
              "Color": "-",
              "Comments": "Failed to ignite"
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21196 A2",
              "Xf  before test": 0.2981,
              "Xf  after test": 0.295425,
              "approx p (bar)": 1.1,
              "XO2": 0.21,
              "HC burnrate (mg/s)": 1.5,
              "O2 flow rate (mg/s)": 5.59,
              "TFP": "No",
              "Tad (K)": 2120,
              "Zst": 0.1665,
              "Hot ignition": "Yes",
              "burn time (sec)": 35,
              "Self -ext or flow term": "FT",
              "Peak burner Temp (C)": 162.9,
              "Peak burner temp (K)": 436.05,
              "Color": "yellow",
              "Comments": null
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21196 F1",
              "Xf  before test": 0.295424848,
              "Xf  after test": 0.291765297,
              "approx p (bar)": 1.1033,
              "XO2": 0.15,
              "HC burnrate (mg/s)": 1.5,
              "O2 flow rate (mg/s)": 5.58675424,
              "TFP": "No",
              "Tad (K)": 1786.994366,
              "Zst": 0.126728327,
              "Hot ignition": "Yes",
              "burn time (sec)": 36,
              "Self -ext or flow term": "FT",
              "Peak burner Temp (C)": 118.5,
              "Peak burner temp (K)": 391.65,
              "Color": "blue",
              "Comments": "Not spherical shape"
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21196 H1",
              "Xf  before test": 0.291765297,
              "Xf  after test": 0.291765297,
              "approx p (bar)": 1.1033,
              "XO2": 0.12,
              "HC burnrate (mg/s)": 1.5,
              "O2 flow rate (mg/s)": 5.58675424,
              "TFP": "No",
              "Tad (K)": 1567.030825,
              "Zst": 0.105556515,
              "Hot ignition": "No",
              "burn time (sec)": 0,
              "Self -ext or flow term": "-",
              "Peak burner Temp (C)": 26.7,
              "Peak burner temp (K)": 299.85,
              "Color": "-",
              "Comments": "Not ignited"
            },
            {
              "Flame Type": "Inverse",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21196 J1",
              "Xf  before test": 0.291765297,
              "Xf  after test": 0.291653541,
              "approx p (bar)": 1.1033,
              "XO2": 0.135,
              "HC burnrate (mg/s)": 1.5,
              "O2 flow rate (mg/s)": 5.58675424,
              "TFP": "No",
              "Tad (K)": 1680.718299,
              "Zst": 0.116987922,
              "Hot ignition": "flash",
              "burn time (sec)": 1,
              "Self -ext or flow term": "SE",
              "Peak burner Temp (C)": 27.8,
              "Peak burner temp (K)": 300.95,
              "Color": "-",
              "Comments": "Not lasted long"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
          "location": "document body",
          "context": "9.772352,0.374893855,Yes,66,FT,131.4,404.55,blue, Inverse,5,propane,21222 A1,0.08,0.079950834,3.3099,0.85,1.5,5.441972789,No,2532.591389,0.664749239,Yes,10,SE,",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Inverse,1,ethane,21196 A1,0.298100,0.298100,1.10,0.21,1.5,5.59,No,2120,0.1665,No,0,-,27.1,300.25,-,Failed to ignite",
        "titleConfidence": "medium",
        "years": [
          2006,
          2029
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f008-PSI-159_Experimental table_CFI-G_Inverse Flames.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f008.extract.json",
      "processingMs": 10
    },
    {
      "id": "f009",
      "name": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
      "sizeBytes": 22166,
      "sha256": "d95a621c3fbd27d204dd32ed29fa17d68f2b779d6a523cde8479ed7ebaa5251a",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 311,
        "headings": [
          "PSI-159_Experimental table_CFI-G_Normal Flames.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f009-PSI-159_Experimental table_CFI-G_Normal Flames.txt"
      },
      "tables": [
        {
          "name": "PSI-159_Experimental table_CFI-G_Normal Flames",
          "columns": [
            "Flame Type",
            "Day",
            "Fuel",
            "Test",
            "Cool flame?",
            "XO2 before test",
            "XO2  after test",
            "approx p (bar)",
            "Xf",
            "mHC (mg/s)",
            "TFP",
            "Tad (K)",
            "Zst",
            "Hot ignition",
            "burn time (sec)",
            "Self-ext or flow term",
            "Peak burner T (C )",
            "Comments"
          ],
          "rowCount": 179,
          "sample": [
            {
              "Flame Type": "Normal",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21088A1",
              "Cool flame?": null,
              "XO2 before test": 0.3939,
              "XO2  after test": 0.389822946,
              "approx p (bar)": 0.9443956,
              "Xf": 1,
              "mHC (mg/s)": 2,
              "TFP": "No",
              "Tad (K)": 2719.323211,
              "Zst": 0.102651783,
              "Hot ignition": "Yes",
              "burn time (sec)": 50,
              "Self-ext or flow term": "SE",
              "Peak burner T (C )": 290.617198,
              "Comments": null
            },
            {
              "Flame Type": "Normal",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21088 B1",
              "Cool flame?": null,
              "XO2 before test": 0.389822946,
              "XO2  after test": 0.386321188,
              "approx p (bar)": 0.9443956,
              "Xf": 1,
              "mHC (mg/s)": 2,
              "TFP": "Yes",
              "Tad (K)": 2713.594987,
              "Zst": 0.101747543,
              "Hot ignition": "Yes",
              "burn time (sec)": 43,
              "Self-ext or flow term": "SE",
              "Peak burner T (C )": 276.009368,
              "Comments": null
            },
            {
              "Flame Type": "Normal",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21088 C1",
              "Cool flame?": null,
              "XO2 before test": 0.386321188,
              "XO2  after test": 0.382905163,
              "approx p (bar)": 0.9443956,
              "Xf": 1,
              "mHC (mg/s)": 2,
              "TFP": "Yes",
              "Tad (K)": 2708.596221,
              "Zst": 0.100968644,
              "Hot ignition": "Yes",
              "burn time (sec)": 42,
              "Self-ext or flow term": "SE",
              "Peak burner T (C )": 266.374008,
              "Comments": "hit burner T limit"
            },
            {
              "Flame Type": "Normal",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21088 D1",
              "Cool flame?": null,
              "XO2 before test": 0.382905163,
              "XO2  after test": 0.380426741,
              "approx p (bar)": 0.9443956,
              "Xf": 1,
              "mHC (mg/s)": 1,
              "TFP": "Yes",
              "Tad (K)": 2703.647801,
              "Zst": 0.100206801,
              "Hot ignition": "Yes",
              "burn time (sec)": 61,
              "Self-ext or flow term": "FT",
              "Peak burner T (C )": 459.195642,
              "Comments": "FC=flow cut"
            },
            {
              "Flame Type": "Normal",
              "Day": 1,
              "Fuel": "ethane",
              "Test": "21088 F1",
              "Cool flame?": null,
              "XO2 before test": 0.380426741,
              "XO2  after test": 0.379858042,
              "approx p (bar)": 0.9443956,
              "Xf": 1,
              "mHC (mg/s)": 0.5,
              "TFP": "Yes",
              "Tad (K)": 2700.011998,
              "Zst": 0.099652813,
              "Hot ignition": "Yes",
              "burn time (sec)": 28,
              "Self-ext or flow term": "FT",
              "Peak burner T (C )": 532.162657,
              "Comments": "Lowest flow rate for ignition"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
          "location": "document body",
          "context": ",Yes,246,FT,435,\"5 transitions from hot to cool, 6 hot and 5 cool flames\" Normal,11,30% butane,21291 C2,,0.389271344,0.388318854,2.0266,0.3,1.75,No,2645.520346",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-pmt",
          "entityLabel": "Photomultiplier tube",
          "entityType": "sensor",
          "source": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
          "location": "document body",
          "context": "SE,269,Extinction detected. Fuel flow stopped in 6 sec after PMT dropped to 0. Normal,2,50% butane,21102 B1,,0.390548195,0.388126117,1.0133,0.125,1.3,No,2501.0",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-159_Experimental table_CFI-G_Normal Flames.csv",
          "location": "document body",
          "context": "0.50665,0.5,0.8,No,2219.09339,0.086741882,No,,-,-, Normal,4,propane,21112A1,,0.3954,0.3940449,0.9443956,1,0.8,No,2729.986983,0.105434724,Yes,43,FT,513.074689,1",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Flame Type,Day,Fuel,Test,Cool flame?, XO2 before test,XO2  after test,approx p (bar),Xf,mHC (mg/s),TFP,Tad (K),Zst,Hot ignition,burn time (sec),Self-ext or flow term,Peak burner T (C ),Comments",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f009-PSI-159_Experimental table_CFI-G_Normal Flames.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f009.extract.json",
      "processingMs": 8
    },
    {
      "id": "f010",
      "name": "PSI-20_Experimental table_ACME BRE.csv",
      "sizeBytes": 1113,
      "sha256": "4aa5d3f98708ceacced5c620d46858b9965f8d4d941b203229f46467d53e5ab7",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 182,
        "headings": [
          "PSI-20_Experimental table_ACME BRE.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-002/f010-PSI-20_Experimental table_ACME BRE.txt"
      },
      "tables": [
        {
          "name": "PSI-20_Experimental table_ACME BRE",
          "columns": [
            "Year",
            "Month",
            "Date",
            "Burner Size (mm)",
            "Fuel Bottle",
            "Oxygen Conc (percent)",
            "Flames Ignited",
            "Notes"
          ],
          "rowCount": 18,
          "sample": [
            {
              "Year": 2019,
              "Month": "Feb",
              "Date": 8,
              "Burner Size (mm)": 25,
              "Fuel Bottle": "100% C2H4",
              "Oxygen Conc (percent)": "21; 26.5; 40",
              "Flames Ignited": 10,
              "Notes": "Oxygen Conc. (as diluted with nitrogen on a volume basis) was varied between tests where approximate concentrations for tests that ignited are listed. The chamber pressures were also varied but are not identified in this summary table."
            },
            {
              "Year": 2019,
              "Month": "Feb",
              "Date": 20,
              "Burner Size (mm)": 25,
              "Fuel Bottle": "100% C2H4",
              "Oxygen Conc (percent)": "26.5; 34",
              "Flames Ignited": 8,
              "Notes": "Flames Ignited is the number ignited on that day (neglecting the day change on ISS)."
            },
            {
              "Year": 2019,
              "Month": "Feb",
              "Date": 25,
              "Burner Size (mm)": 25,
              "Fuel Bottle": "50% C2H4",
              "Oxygen Conc (percent)": "21; 26.5; 34; 40",
              "Flames Ignited": 8,
              "Notes": null
            },
            {
              "Year": 2019,
              "Month": "March",
              "Date": 4,
              "Burner Size (mm)": 25,
              "Fuel Bottle": "50% C2H4",
              "Oxygen Conc (percent)": "26.5; 40",
              "Flames Ignited": 6,
              "Notes": null
            },
            {
              "Year": 2019,
              "Month": "March",
              "Date": 7,
              "Burner Size (mm)": 25,
              "Fuel Bottle": "50% C2H4",
              "Oxygen Conc (percent)": "3400%",
              "Flames Ignited": 6,
              "Notes": null
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-20_Experimental table_ACME BRE.csv",
          "location": "document body",
          "context": "the number ignited on that day (neglecting the day change on ISS). 2019,Feb,25,25,50% C2H4,21; 26.5; 34; 40,8, 2019,March,4,25,50% C2H4,26.5; 40,6, 2019,Marc",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-20_Experimental table_ACME BRE.csv",
          "location": "document body",
          "context": ", 2020,Oct,17,25,100% C2H4,26.5; 34,13, 2020,Dec,5,25,100% CH4,25; 34; 40,21, 2020,Dec,4,25,100% CH4,25; 40,18, 2020,Dec,11,25,50% C2H4,25; 40,12, 2020,Dec",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Year,Month,Date,Burner Size (mm),Fuel Bottle,Oxygen Conc (percent),Flames Ignited,Notes",
        "titleConfidence": "medium",
        "years": [
          2019,
          2020,
          2021
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-002/f010-PSI-20_Experimental table_ACME BRE.csv",
      "extractedPath": "data/extracted/batches/B-20261112-002/f010.extract.json",
      "processingMs": 3
    }
  ],
  "totals": {
    "files": 10,
    "extracted": 10,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 10,
    "pages": 0,
    "chars": 2331,
    "tables": 10,
    "tableRows": 1278,
    "equations": 0,
    "figures": 0,
    "entities": 15,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 2,
    "files": 11,
    "uniqueFiles": 11,
    "duplicateFiles": 0,
    "documents": 11,
    "pages": 0,
    "chars": 2558,
    "tables": 11,
    "tableRows": 1280,
    "equations": 0,
    "figures": 0,
    "mediaAssets": 0,
    "entities": 109,
    "errors": 0,
    "userConfirmedAllUploads": false,
    "lastBatchId": "B-20261112-002",
    "updatedAt": "2026-11-12T20:27:06.535Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261112-003.json', '{
  "batchId": "B-20261112-003",
  "receivedAt": "2026-11-12T20:27:28.720Z",
  "fileCount": 9,
  "files": [
    {
      "id": "f001",
      "name": "PSI-21_Experimental table_CLD Flame.csv",
      "sizeBytes": 2454,
      "sha256": "9fafbc5b3dddaf715ce8025ed9154ce297803f7b69a935f077ec26c8249e44c0",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 180,
        "headings": [
          "PSI-21_Experimental table_CLD Flame.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f001-PSI-21_Experimental table_CLD Flame.txt"
      },
      "tables": [
        {
          "name": "PSI-21_Experimental table_CLD Flame",
          "columns": [
            "Test Type",
            "Test Day",
            "Fuel MFC",
            "N2 MFC",
            "Fuel Bottle",
            "Fuel conc. Range",
            "Flames ignited",
            "Notes"
          ],
          "rowCount": 32,
          "sample": [
            {
              "Test Type": "Methane based test",
              "Test Day": 17319,
              "Fuel MFC": 0.1,
              "N2 MFC": 0.1,
              "Fuel Bottle": "40% CH4",
              "Fuel conc. Range": "30%-40%",
              "Flames ignited": 10,
              "Notes": "Test Day - includes the year as the first two digits followed by the 3-digit day of the year (where any late-hour transition to the next day is neglected). MFC - identifies the maximum flow rate of the specified ACME Mass Flow Controller (MFC) in slpm on a nitrogen basis. Fuel conc. - (as diluted with nitrogen on a volume basis) was varied between tests and sometimes during tests where the listing here accounts for both. However, it does not account for extinction that sometimes occurred before the flame fully reached the lowest concentration. Flames ignited is the number ignited on that test day."
            },
            {
              "Test Type": "Methane based test",
              "Test Day": 17324,
              "Fuel MFC": 0.1,
              "N2 MFC": 0.1,
              "Fuel Bottle": "40% CH5",
              "Fuel conc. Range": "30%-40%",
              "Flames ignited": 5,
              "Notes": null
            },
            {
              "Test Type": "Methane based test",
              "Test Day": 17342,
              "Fuel MFC": 0.1,
              "N2 MFC": 0.1,
              "Fuel Bottle": "40% CH6",
              "Fuel conc. Range": "40%",
              "Flames ignited": 8,
              "Notes": null
            },
            {
              "Test Type": "Methane based test",
              "Test Day": 17356,
              "Fuel MFC": 0.1,
              "N2 MFC": 0.1,
              "Fuel Bottle": "40% CH7",
              "Fuel conc. Range": "30%-40%",
              "Flames ignited": 3,
              "Notes": null
            },
            {
              "Test Type": "Methane based test",
              "Test Day": 18003,
              "Fuel MFC": 0.1,
              "N2 MFC": 0.1,
              "Fuel Bottle": "40% CH8",
              "Fuel conc. Range": "25%-40%",
              "Flames ignited": 9,
              "Notes": null
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-21_Experimental table_CLD Flame.csv",
          "location": "document body",
          "context": "ed). MFC - identifies the maximum flow rate of the specified ACME Mass Flow Controller (MFC) in slpm on a nitrogen basis. Fuel conc. - (as diluted with nitrogen",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-flow",
          "entityLabel": "Flow controller / anemometer",
          "entityType": "sensor",
          "source": "PSI-21_Experimental table_CLD Flame.csv",
          "location": "document body",
          "context": "identifies the maximum flow rate of the specified ACME Mass Flow Controller (MFC) in slpm on a nitrogen basis. Fuel conc. - (as diluted with nitrogen on a volu",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-21_Experimental table_CLD Flame.csv",
          "location": "document body",
          "context": "FC,N2 MFC,Fuel Bottle,Fuel conc. Range,Flames ignited,Notes Methane based test,17319,0.1,0.1,40% CH4,30%-40%,10,\"Test Day - includes the year as the first two",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Test Type,Test Day,Fuel MFC,N2 MFC,Fuel Bottle,Fuel conc. Range,Flames ignited,Notes",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f001-PSI-21_Experimental table_CLD Flame.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f001.extract.json",
      "processingMs": 9
    },
    {
      "id": "f002",
      "name": "PSI-22_Experimental table_ACME E-FIELD Flames.csv",
      "sizeBytes": 2475,
      "sha256": "69090c357b83ae38d161d29001d1d32b40fd77b13324ca6585ee990cdceef524",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 200,
        "headings": [
          "PSI-22_Experimental table_ACME E-FIELD Flames.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f002-PSI-22_Experimental table_ACME E-FIELD Flames.txt"
      },
      "tables": [
        {
          "name": "PSI-22_Experimental table_ACME E-FIELD Flames",
          "columns": [
            "Test Type",
            "Test Day",
            "Year",
            "Month",
            "Date",
            "Mesh Polarity",
            "Fuel Bottle",
            "Fuel Conc",
            "Flames Ignited",
            "Notes"
          ],
          "rowCount": 32,
          "sample": [
            {
              "Test Type": "First round of tests with coflow burner",
              "Test Day": 18073,
              "Year": 2018,
              "Month": 3,
              "Date": 14,
              "Mesh Polarity": "negative",
              "Fuel Bottle": "100% CH4",
              "Fuel Conc": "100%",
              "Flames Ignited": 10,
              "Notes": "Test day is formatted YYDDD where YY identifies year and DDD identifies day of year (GMT)."
            },
            {
              "Test Type": "First round of tests with coflow burner",
              "Test Day": 18078,
              "Year": 2018,
              "Month": 3,
              "Date": 19,
              "Mesh Polarity": "negative",
              "Fuel Bottle": "100% CH4",
              "Fuel Conc": "70%",
              "Flames Ignited": 10,
              "Notes": "Mesh polarity refers to the polarity of the high-voltage power supply and the copper electrode relative to the burner."
            },
            {
              "Test Type": null,
              "Test Day": null,
              "Year": null,
              "Month": null,
              "Date": null,
              "Mesh Polarity": null,
              "Fuel Bottle": null,
              "Fuel Conc": "100%",
              "Flames Ignited": null,
              "Notes": "Fuel Conc. (diluted with nitrogen on a volume basis) was varied between tests, but typically matched the bottle. The list only accounts for flames ignited."
            },
            {
              "Test Type": "First round of tests with coflow burner",
              "Test Day": 18080,
              "Year": 2018,
              "Month": 3,
              "Date": 21,
              "Mesh Polarity": "negative",
              "Fuel Bottle": "40% CH4",
              "Fuel Conc": "40%",
              "Flames Ignited": 8,
              "Notes": "Flames Ignited is the number ignited on that day (neglecting the day change on ISS)."
            },
            {
              "Test Type": "First round of tests with coflow burner",
              "Test Day": 18087,
              "Year": 2018,
              "Month": 3,
              "Date": 28,
              "Mesh Polarity": "negative",
              "Fuel Bottle": "100% C2H4",
              "Fuel Conc": "80%",
              "Flames Ignited": 10,
              "Notes": null
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-22_Experimental table_ACME E-FIELD Flames.csv",
          "location": "document body",
          "context": "the number ignited on that day (neglecting the day change on ISS). First round of tests with coflow burner,18087,2018,3,28,negative,100% C2H4,80%,10, ,,,,,,,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-22_Experimental table_ACME E-FIELD Flames.csv",
          "location": "document body",
          "context": "nd of tests with coflow burner,18073,2018,3,14,negative,100% CH4,100%,10,Test day is formatted YYDDD where YY identifies year and DDD identifies day of year (GM",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Test Type,Test Day,Year,Month,Date,Mesh Polarity,Fuel Bottle,Fuel Conc,Flames Ignited,Notes",
        "titleConfidence": "medium",
        "years": [
          2018
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f002-PSI-22_Experimental table_ACME E-FIELD Flames.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f002.extract.json",
      "processingMs": 10
    },
    {
      "id": "f003",
      "name": "PSI-23_Experimental table_ACME s-Flame.csv",
      "sizeBytes": 2456,
      "sha256": "16cd10f50bd2e962887c8eb4077e5a9b3e790c78de8e0361c0b77e19300be7cf",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 181,
        "headings": [
          "PSI-23_Experimental table_ACME s-Flame.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f003-PSI-23_Experimental table_ACME s-Flame.txt"
      },
      "tables": [
        {
          "name": "PSI-23_Experimental table_ACME s-Flame",
          "columns": [
            "Test Type",
            "Test Day*",
            "Year",
            "Month",
            "Date",
            "Atmosphere*",
            "Fuel Bottle",
            "Flames Ignited*",
            "Notes"
          ],
          "rowCount": 18,
          "sample": [
            {
              "Test Type": "First round of tests with nitrogen-diluted fuel and oxygen",
              "Test Day*": 19254,
              "Year": 2019,
              "Month": "Sept.",
              "Date": 11,
              "Atmosphere*": "~21% O2 with N2",
              "Fuel Bottle": "50% C2H4 with N2",
              "Flames Ignited*": 13,
              "Notes": "*Test Day is formatted YYDDD where YY identfies year and DDD identifies day of year (GMT)."
            },
            {
              "Test Type": "First round of tests with nitrogen-diluted fuel and oxygen",
              "Test Day*": 19256,
              "Year": 2019,
              "Month": "Sept.",
              "Date": 13,
              "Atmosphere*": "~21% O2 with N3",
              "Fuel Bottle": "50% C2H4 with N3",
              "Flames Ignited*": 16,
              "Notes": "*Atmosphere is ~1 atm but pressure increases and O2% drops with vitiation."
            },
            {
              "Test Type": "First round of tests with nitrogen-diluted fuel and oxygen",
              "Test Day*": 19304,
              "Year": 2019,
              "Month": "Oct.",
              "Date": 31,
              "Atmosphere*": "~21% O2 with N4",
              "Fuel Bottle": "45% CH4 with N2",
              "Flames Ignited*": 9,
              "Notes": "*Flames Ignited is the number ignited on that day (neglecting the day change on ISS)."
            },
            {
              "Test Type": "First round of tests with nitrogen-diluted fuel and oxygen",
              "Test Day*": 19308,
              "Year": 2019,
              "Month": "Nov.",
              "Date": 4,
              "Atmosphere*": "~30% O2 with N2",
              "Fuel Bottle": "45% CH4 with N3",
              "Flames Ignited*": 21,
              "Notes": null
            },
            {
              "Test Type": "First round of tests with nitrogen-diluted fuel and oxygen",
              "Test Day*": 19352,
              "Year": 2019,
              "Month": "Dec.",
              "Date": 18,
              "Atmosphere*": "~21% O2 with N2",
              "Fuel Bottle": "100% H2",
              "Flames Ignited*": 10,
              "Notes": null
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-23_Experimental table_ACME s-Flame.csv",
          "location": "document body",
          "context": "the number ignited on that day (neglecting the day change on ISS). First round of tests with nitrogen-diluted fuel and oxygen,19308,2019,Nov.,4,~30% O2 with N2",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-23_Experimental table_ACME s-Flame.csv",
          "location": "document body",
          "context": "luted fuel and oxygen,19304,2019,Oct.,31,~21% O2 with N4,45% CH4 with N2,9,*Flames Ignited is the number ignited on that day (neglecting the day change on ISS).",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-he",
          "entityLabel": "Helium (diluent)",
          "entityType": "suppressant",
          "source": "PSI-23_Experimental table_ACME s-Flame.csv",
          "location": "document body",
          "context": "He,\"25% H2, 20% CH4, with He\",7, Second round of tests with helium-diluted fuel and oxygen,20136,2020,May,15,~21% O2 with He,\"20% H2, 25% CH4, with He\",11, Se",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Test Type,Test Day*,Year,Month,Date,Atmosphere*,Fuel Bottle,Flames Ignited*,Notes",
        "titleConfidence": "medium",
        "years": [
          2019,
          2020
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f003-PSI-23_Experimental table_ACME s-Flame.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f003.extract.json",
      "processingMs": 6
    },
    {
      "id": "f004",
      "name": "PSI-25_Experimental table_BASS-II.csv",
      "sizeBytes": 16590,
      "sha256": "71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042",
      "kind": "csv",
      "status": "extracted",
      "domain": "materials",
      "text": {
        "chars": 385,
        "headings": [
          "PSI-25_Experimental table_BASS-II.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f004-PSI-25_Experimental table_BASS-II.txt"
      },
      "tables": [
        {
          "name": "PSI-25_Experimental table_BASS-II",
          "columns": [
            "PI",
            "Test #",
            "Date",
            "GMT",
            "Sample #",
            "Fuel Sample Material",
            "Flow restrictor",
            "Fan display",
            "Air display",
            "Radiometer gain   (1000   250   50   10)",
            "Total Frames Shot",
            "Calibrated  initial O2 % by vol",
            "Calibrated final O2 % by vol",
            "Initial CO2 % by vol",
            "Final CO2 % by vol",
            "Initial CO (ppm)",
            "Final CO (ppm)"
          ],
          "rowCount": 129,
          "sample": [
            {
              "PI": "Bhattacharjee",
              "Test #": "B1",
              "Date": "2/19/2014",
              "GMT": 50,
              "Sample #": 147,
              "Fuel Sample Material": "100 micron PMMA film   2 cm wide",
              "Flow restrictor": 2,
              "Fan display": 62,
              "Air display": 5,
              "Radiometer gain   (1000   250   50   10)": 50,
              "Total Frames Shot": 57,
              "Calibrated  initial O2 % by vol": 22.2,
              "Calibrated final O2 % by vol": 22.2,
              "Initial CO2 % by vol": 0.44,
              "Final CO2 % by vol": 0.44,
              "Initial CO (ppm)": 0,
              "Final CO (ppm)": 6
            },
            {
              "PI": "Bhattacharjee",
              "Test #": "B2",
              "Date": "2/19/2014",
              "GMT": 50,
              "Sample #": 155,
              "Fuel Sample Material": "200 micron PMMA film   2 cm wide",
              "Flow restrictor": 2,
              "Fan display": 62,
              "Air display": 5,
              "Radiometer gain   (1000   250   50   10)": 50,
              "Total Frames Shot": "none",
              "Calibrated  initial O2 % by vol": 22.2,
              "Calibrated final O2 % by vol": 1.6,
              "Initial CO2 % by vol": 0.44,
              "Final CO2 % by vol": null,
              "Initial CO (ppm)": 6,
              "Final CO (ppm)": null
            },
            {
              "PI": "Bhattacharjee",
              "Test #": "B3",
              "Date": "2/19/2014",
              "GMT": 50,
              "Sample #": 148,
              "Fuel Sample Material": "100 micron film   2 cm wide",
              "Flow restrictor": 2,
              "Fan display": 47,
              "Air display": 2,
              "Radiometer gain   (1000   250   50   10)": 50,
              "Total Frames Shot": 253,
              "Calibrated  initial O2 % by vol": 22.2,
              "Calibrated final O2 % by vol": 21.8,
              "Initial CO2 % by vol": 0.43,
              "Final CO2 % by vol": 0.49,
              "Initial CO (ppm)": 12,
              "Final CO (ppm)": 19
            },
            {
              "PI": "Bhattacharjee",
              "Test #": "B4",
              "Date": "2/19/2014",
              "GMT": 50,
              "Sample #": 159,
              "Fuel Sample Material": "300 micron PMMA film   2 cm wide",
              "Flow restrictor": 2,
              "Fan display": 61,
              "Air display": 5,
              "Radiometer gain   (1000   250   50   10)": 50,
              "Total Frames Shot": 137,
              "Calibrated  initial O2 % by vol": 22.2,
              "Calibrated final O2 % by vol": 22.2,
              "Initial CO2 % by vol": 0.44,
              "Final CO2 % by vol": 0.51,
              "Initial CO (ppm)": -1,
              "Final CO (ppm)": 10
            },
            {
              "PI": "Bhattacharjee",
              "Test #": "B5",
              "Date": "2/19/2014",
              "GMT": 50,
              "Sample #": 156,
              "Fuel Sample Material": "200 micron  2 cm wide",
              "Flow restrictor": 2,
              "Fan display": 59,
              "Air display": 5,
              "Radiometer gain   (1000   250   50   10)": 50,
              "Total Frames Shot": 206,
              "Calibrated  initial O2 % by vol": 22.2,
              "Calibrated final O2 % by vol": 21.9,
              "Initial CO2 % by vol": 0.43,
              "Final CO2 % by vol": 0.43,
              "Initial CO (ppm)": 0,
              "Final CO (ppm)": 12
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "sen-radiometer",
          "entityLabel": "Radiometer",
          "entityType": "sensor",
          "source": "PSI-25_Experimental table_BASS-II.csv",
          "location": "document body",
          "context": "Fuel Sample Material,Flow restrictor,Fan display,Air display,Radiometer gain (1000 250 50 10),Total Frames Shot,Calibrated initial O2 % by vol ,Calibra",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-25_Experimental table_BASS-II.csv",
          "location": "document body",
          "context": "Final CO (ppm) Bhattacharjee,B1,2/19/2014,50,147,100 micron PMMA film 2 cm wide,2,62,5,50,57,22.2,22.2,0.44,0.44,0,6 Bhattacharjee,B2,2/19/2014,50,155,200 m",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-25_Experimental table_BASS-II.csv",
          "location": "document body",
          "context": ",246,20.9,20.2,0.38,1,43,205 T''ien,T1,2/14/2014,45,128,2 cm SIBAL,2,80,10,50,85,18.5,18.5,0.35,0.41,0,40 T''ien,T2,2/14/2014,45,129,2 cm SIBAL,2,80 59 55,9",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "PSI-25_Experimental table_BASS-II.csv",
          "location": "document body",
          "context": "250,77,20.7,20.5,0.41,0.47,-1,10 Ferkul,F1,2/19/2014,50,227,Nomex natural (nomex III),2,82,9.5,250,208,22.2,22.2,0.46,0.45,0,2 Ferkul,F2,7/28/2014,209,228m,No",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Bhattacharjee,B1,2/19/2014,50,147,100 micron PMMA film   2 cm wide,2,62,5,50,57,22.2,22.2,0.44,0.44,0,6",
        "titleConfidence": "medium",
        "years": [
          2014,
          2016,
          2018
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f004-PSI-25_Experimental table_BASS-II.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f004.extract.json",
      "processingMs": 19
    },
    {
      "id": "f005",
      "name": "PSI-26_Experimental table_BASS.csv",
      "sizeBytes": 4726,
      "sha256": "ccfc3c54d948b64a1c5d2596a63c7c8019e51df0c91a1d62f039f48fa28c300f",
      "kind": "csv",
      "status": "extracted",
      "domain": "materials",
      "text": {
        "chars": 149,
        "headings": [
          "PSI-26_Experimental table_BASS.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f005-PSI-26_Experimental table_BASS.txt"
      },
      "tables": [
        {
          "name": "PSI-26_Experimental table_BASS",
          "columns": [
            "Date",
            "GMT",
            "As Run Test #",
            "Test #",
            "Sample #",
            "Fuel Sample Material"
          ],
          "rowCount": 122,
          "sample": [
            {
              "Date": "3/30/2012",
              "GMT": 90,
              "As Run Test #": 1,
              "Test #": 1,
              "Sample #": 4,
              "Fuel Sample Material": "SIBAL 2 cm"
            },
            {
              "Date": "3/30/2012",
              "GMT": 90,
              "As Run Test #": 2,
              "Test #": 42,
              "Sample #": 24,
              "Fuel Sample Material": "PMMA sphere 2 cm"
            },
            {
              "Date": "3/30/2012",
              "GMT": 90,
              "As Run Test #": 3,
              "Test #": 18,
              "Sample #": 19,
              "Fuel Sample Material": "PMMA sphere 1 cm"
            },
            {
              "Date": "4/5/2012",
              "GMT": 96,
              "As Run Test #": 4,
              "Test #": 7,
              "Sample #": 10,
              "Fuel Sample Material": "SIBAL 2 cm"
            },
            {
              "Date": "4/5/2012",
              "GMT": 96,
              "As Run Test #": 5,
              "Test #": 8,
              "Sample #": 11,
              "Fuel Sample Material": "SIBAL 2 cm"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-26_Experimental table_BASS.csv",
          "location": "document body",
          "context": "aterial 3/30/2012,90,1,1,4,SIBAL 2 cm 3/30/2012,90,2,42,24,PMMA sphere 2 cm 3/30/2012,90,3,18,19,PMMA sphere 1 cm 4/5/2012,96,4,7,10,SIBAL 2 cm 4/5/2012,96",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-26_Experimental table_BASS.csv",
          "location": "document body",
          "context": "t #,Test #,Sample #,Fuel Sample Material 3/30/2012,90,1,1,4,SIBAL 2 cm 3/30/2012,90,2,42,24,PMMA sphere 2 cm 3/30/2012,90,3,18,19,PMMA sphere 1 cm 4/5/2012,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "PSI-26_Experimental table_BASS.csv",
          "location": "document body",
          "context": "cm 5/10/2012,131,13,10,2,SIBAL 1 cm 5/10/2012,131,14,12,27,Nomex blend 2 cm 5/11/2012,132,15,54,21,PMMA 2 cm 5/11/2012,132,16,55,21,PMMA 2 cm 5/11/2012,132",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Date,GMT,As Run Test #,Test #,Sample #,Fuel Sample Material",
        "titleConfidence": "medium",
        "years": [
          2012,
          2013
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f005-PSI-26_Experimental table_BASS.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f005.extract.json",
      "processingMs": 6
    },
    {
      "id": "f006",
      "name": "PSI-39_Experimental table_CFI.csv",
      "sizeBytes": 7792,
      "sha256": "fb898e28762353aa132c16b886dbd207a024b1dd3c9bed5928d70d8036d2ec7e",
      "kind": "csv",
      "status": "extracted",
      "domain": "data",
      "text": {
        "chars": 172,
        "headings": [
          "PSI-39_Experimental table_CFI.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f006-PSI-39_Experimental table_CFI.txt"
      },
      "tables": [
        {
          "name": "PSI-39_Experimental table_CFI",
          "columns": [
            "Flex Number",
            "Test Date",
            "Local Time",
            "CIR",
            "Pressure",
            "Oxygen",
            "Nitrogen",
            "Helium",
            "Fiber",
            "Fuel"
          ],
          "rowCount": 87,
          "sample": [
            {
              "Flex Number": 1206,
              "Test Date": "9-Mar-17",
              "Local Time": "02:03:08 pm est",
              "CIR": "f068a03",
              "Pressure": "1 atm",
              "Oxygen": 0.21,
              "Nitrogen": 0.79,
              "Helium": 0,
              "Fiber": "No",
              "Fuel": "C12H26"
            },
            {
              "Flex Number": 1207,
              "Test Date": "9-Mar-17",
              "Local Time": "03:53:26 pm est",
              "CIR": "f068a07",
              "Pressure": "1 atm",
              "Oxygen": 0.21,
              "Nitrogen": 0.79,
              "Helium": 0,
              "Fiber": "Yes",
              "Fuel": "C12H26"
            },
            {
              "Flex Number": 1208,
              "Test Date": "9-Mar-17",
              "Local Time": "04:25:22 pm est",
              "CIR": "f068a08",
              "Pressure": "1 atm",
              "Oxygen": 0.21,
              "Nitrogen": 0.79,
              "Helium": 0,
              "Fiber": "Yes",
              "Fuel": "C12H26"
            },
            {
              "Flex Number": 1209,
              "Test Date": "9-Mar-17",
              "Local Time": "04:49:43 pm est",
              "CIR": "f068a09",
              "Pressure": "1 atm",
              "Oxygen": 0.21,
              "Nitrogen": 0.79,
              "Helium": 0,
              "Fiber": "Yes",
              "Fuel": "C12H26"
            },
            {
              "Flex Number": 1210,
              "Test Date": "9-Mar-17",
              "Local Time": "05:43:01 pm est",
              "CIR": "f068a11",
              "Pressure": "1 atm",
              "Oxygen": 0.21,
              "Nitrogen": 0.79,
              "Helium": 0,
              "Fiber": "Yes",
              "Fuel": "C12H26"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-39_Experimental table_CFI.csv",
          "location": "document body",
          "context": "Flex Number,Test Date,Local Time,CIR ,Pressure,Oxygen,Nitrogen,Helium,Fiber,Fuel 1206,9-Mar-17,02:",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-39_Experimental table_CFI.csv",
          "location": "document body",
          "context": "Flex Number,Test Date,Local Time,CIR ,Pressure,Oxygen,Nitrogen,Helium,Fiber,Fuel 1206,9-Mar-17,02:03:08 pm est,f068a03,1 atm,0.21,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-he",
          "entityLabel": "Helium (diluent)",
          "entityType": "suppressant",
          "source": "PSI-39_Experimental table_CFI.csv",
          "location": "document body",
          "context": "ex Number,Test Date,Local Time,CIR ,Pressure,Oxygen,Nitrogen,Helium,Fiber,Fuel 1206,9-Mar-17,02:03:08 pm est,f068a03,1 atm,0.21,0.79,0,No,C12H26 1207,9-Mar-1",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Flex Number,Test Date,Local Time,CIR ,Pressure,Oxygen,Nitrogen,Helium,Fiber,Fuel",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f006-PSI-39_Experimental table_CFI.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f006.extract.json",
      "processingMs": 7
    },
    {
      "id": "f007",
      "name": "PSI-68_Experimental table_Flex2.csv",
      "sizeBytes": 1029,
      "sha256": "cc57ad1bd9977aa13e7ac6c3aa618303012686e232b36c052c6a9f1a74e5f528",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 247,
        "headings": [
          "PSI-68_Experimental table_Flex2.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f007-PSI-68_Experimental table_Flex2.txt"
      },
      "tables": [
        {
          "name": "PSI-68_Experimental table_Flex2",
          "columns": [
            "Sample (Fuel Type)",
            "Initial Droplet Diameter (mm)",
            "Ambient Gas Mixture",
            "Oxygen Mole Fraction",
            "Ambient Pressure (atm)",
            "Ambient Temperature (C)",
            "Flow Velocity (cm/s)"
          ],
          "rowCount": 8,
          "sample": [
            {
              "Sample (Fuel Type)": "IsoOctane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            },
            {
              "Sample (Fuel Type)": "n-Octane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            },
            {
              "Sample (Fuel Type)": "Heptane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            },
            {
              "Sample (Fuel Type)": "Decane (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            },
            {
              "Sample (Fuel Type)": "Ethanol (pure)",
              "Initial Droplet Diameter (mm)": "1.5 - 5",
              "Ambient Gas Mixture": "O2/N2 or O2/He",
              "Oxygen Mole Fraction": "0.17; 0.21;0.25; 0.3",
              "Ambient Pressure (atm)": "0.5; 1.0; 1.5; 2.0; or 3.0",
              "Ambient Temperature (C)": 25,
              "Flow Velocity (cm/s)": "0.1 - 5"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fuel-ethanol",
          "entityLabel": "Ethanol",
          "entityType": "fuel",
          "source": "PSI-68_Experimental table_Flex2.csv",
          "location": "document body",
          "context": "0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 Ethanol (pure),1.5 - 5,O2/N2 or O2/He,0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-heptane",
          "entityLabel": "n-Heptane",
          "entityType": "fuel",
          "source": "PSI-68_Experimental table_Flex2.csv",
          "location": "document body",
          "context": "0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 Heptane (pure),1.5 - 5,O2/N2 or O2/He,0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-octane",
          "entityLabel": "n-Octane",
          "entityType": "fuel",
          "source": "PSI-68_Experimental table_Flex2.csv",
          "location": "document body",
          "context": "17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 n-Octane (pure),1.5 - 5,O2/N2 or O2/He,0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 H",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-decane",
          "entityLabel": "n-Decane",
          "entityType": "fuel",
          "source": "PSI-68_Experimental table_Flex2.csv",
          "location": "document body",
          "context": "0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 Decane (pure),1.5 - 5,O2/N2 or O2/He,0.17; 0.21;0.25; 0.3,0.5; 1.0; 1.5; 2.0; or 3.0 ,25,0.1 - 5 E",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Sample (Fuel Type),Initial Droplet Diameter (mm),Ambient Gas Mixture ,Oxygen Mole Fraction,Ambient Pressure (atm), Ambient Temperature (C),Flow Velocity (cm/s)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f007-PSI-68_Experimental table_Flex2.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f007.extract.json",
      "processingMs": 4
    },
    {
      "id": "f008",
      "name": "PSI-69_Experimental table_FLEX.csv",
      "sizeBytes": 24776,
      "sha256": "37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 462,
        "headings": [
          "PSI-69_Experimental table_FLEX.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f008-PSI-69_Experimental table_FLEX.txt"
      },
      "tables": [
        {
          "name": "PSI-69_Experimental table_FLEX",
          "columns": [
            "FLEX Test #",
            "FLEX Identifier",
            "Test Date",
            "Test GMT",
            "Fuel",
            "Ambient pressure; mmHg",
            "O initial ambient composition; mole fraction",
            "N initial ambient composition; mole fraction",
            "CO initial ambient composition; mole fraction",
            "He initial ambient composition; mole fraction",
            "Droplet initial diameter; mm",
            "Visible flame extinction diameter; mm",
            "Burning rate; mm",
            "Burn time; s",
            "Test end"
          ],
          "rowCount": 274,
          "sample": [
            {
              "FLEX Test #": 1,
              "FLEX Identifier": "20CAL08",
              "Test Date": "3/5/2009",
              "Test GMT": "17:22:03",
              "Fuel": "Methanol",
              "Ambient pressure; mmHg": 757.7,
              "O initial ambient composition; mole fraction": 0.21,
              "N initial ambient composition; mole fraction": 0.79,
              "CO initial ambient composition; mole fraction": 0,
              "He initial ambient composition; mole fraction": 0,
              "Droplet initial diameter; mm": 1.69,
              "Visible flame extinction diameter; mm": 0.89,
              "Burning rate; mm": 0.52,
              "Burn time; s": 4.3,
              "Test end": "Disruption"
            },
            {
              "FLEX Test #": 2,
              "FLEX Identifier": "20CAL10",
              "Test Date": "3/5/2009",
              "Test GMT": "19:20:06",
              "Fuel": "Methanol",
              "Ambient pressure; mmHg": 762,
              "O initial ambient composition; mole fraction": 0.21,
              "N initial ambient composition; mole fraction": 0.79,
              "CO initial ambient composition; mole fraction": 0,
              "He initial ambient composition; mole fraction": 0,
              "Droplet initial diameter; mm": 1.86,
              "Visible flame extinction diameter; mm": 0.94,
              "Burning rate; mm": 0.6,
              "Burn time; s": 5,
              "Test end": "Extinction"
            },
            {
              "FLEX Test #": 3,
              "FLEX Identifier": "20CAL12",
              "Test Date": "3/5/2009",
              "Test GMT": "21:17:46",
              "Fuel": "Methanol",
              "Ambient pressure; mmHg": 764.2,
              "O initial ambient composition; mole fraction": 0.21,
              "N initial ambient composition; mole fraction": 0.79,
              "CO initial ambient composition; mole fraction": 0,
              "He initial ambient composition; mole fraction": 0,
              "Droplet initial diameter; mm": 1.61,
              "Visible flame extinction diameter; mm": 0.92,
              "Burning rate; mm": 0.58,
              "Burn time; s": 3.2,
              "Test end": "Extinction"
            },
            {
              "FLEX Test #": 4,
              "FLEX Identifier": "30CAL02",
              "Test Date": "3/31/2009",
              "Test GMT": "17:16:18",
              "Fuel": "Methanol",
              "Ambient pressure; mmHg": 760,
              "O initial ambient composition; mole fraction": 0.21,
              "N initial ambient composition; mole fraction": 0.79,
              "CO initial ambient composition; mole fraction": 0,
              "He initial ambient composition; mole fraction": 0,
              "Droplet initial diameter; mm": 2.06,
              "Visible flame extinction diameter; mm": null,
              "Burning rate; mm": 0.6,
              "Burn time; s": 7.64,
              "Test end": "Extinction"
            },
            {
              "FLEX Test #": 5,
              "FLEX Identifier": "30CAL03",
              "Test Date": "3/31/2009",
              "Test GMT": "19:00:48",
              "Fuel": "Methanol",
              "Ambient pressure; mmHg": 760,
              "O initial ambient composition; mole fraction": 0.21,
              "N initial ambient composition; mole fraction": 0.79,
              "CO initial ambient composition; mole fraction": 0,
              "He initial ambient composition; mole fraction": 0,
              "Droplet initial diameter; mm": 1.92,
              "Visible flame extinction diameter; mm": 0.81,
              "Burning rate; mm": 0.48,
              "Burn time; s": 6.34,
              "Test end": "Extinction"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-69_Experimental table_FLEX.csv",
          "location": "document body",
          "context": "FLEX Test #,FLEX Identifier,Test Date,Test GMT,Fuel,Ambient pressure; mmHg,O initial ambient composi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methanol",
          "entityLabel": "Methanol",
          "entityType": "fuel",
          "source": "PSI-69_Experimental table_FLEX.csv",
          "location": "document body",
          "context": "rate; mm,Burn time; s,Test end 1,20CAL08,3/5/2009,17:22:03,Methanol,757.7,0.21,0.79,0,0,1.69,0.89,0.52,4.3,Disruption 2,20CAL10,3/5/2009,19:20:06,Methanol,76",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-heptane",
          "entityLabel": "n-Heptane",
          "entityType": "fuel",
          "source": "PSI-69_Experimental table_FLEX.csv",
          "location": "document body",
          "context": ",2.54,1.53,0.51,9.6,Extinction 7,20CAL13,4/10/2009,13:26:11,Heptane,761.3,0.21,0.79,0,0,1.87,,0.67,5.3,Disruption 8,30CAL06,4/10/2009,18:07:15,Heptane,762.4,0",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "1,20CAL08,3/5/2009,17:22:03,Methanol,757.7,0.21,0.79,0,0,1.69,0.89,0.52,4.3,Disruption",
        "titleConfidence": "medium",
        "years": [
          2009,
          2010,
          2011
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f008-PSI-69_Experimental table_FLEX.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f008.extract.json",
      "processingMs": 10
    },
    {
      "id": "f009",
      "name": "PSI-99_Experimental table_SAFFIRE-2.csv",
      "sizeBytes": 1973,
      "sha256": "3c24390b9ef86f3d1ebaab911a1a3cc95a8759aebf42062371370e6d4b31b8ac",
      "kind": "csv",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 362,
        "headings": [
          "PSI-99_Experimental table_SAFFIRE-2.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261112-003/f009-PSI-99_Experimental table_SAFFIRE-2.txt"
      },
      "tables": [
        {
          "name": "PSI-99_Experimental table_SAFFIRE-2",
          "columns": [
            "Sample Number",
            "Material",
            "Samle Thickness",
            "Sample Length",
            "Sample Width (cm)",
            "Air Flow (cm/s)",
            "Percent O2 (Note 1)",
            "Ignition Power (W)",
            "Ignition Time (s)",
            "Burn Time (s)",
            "Flow Direction",
            "?-g Burn Length",
            "?-g Spread Length",
            "1-g Burn Length",
            "1-g Spread Rate",
            "Camera 1",
            "Camera 2"
          ],
          "rowCount": 15,
          "sample": [
            {
              "Sample Number": "2-1",
              "Material": "Silicone",
              "Samle Thickness": "0.27 mm",
              "Sample Length": "29 cm",
              "Sample Width (cm)": "5 cm",
              "Air Flow (cm/s)": "20 cm/s",
              "Percent O2 (Note 1)": "~ 21.5",
              "Ignition Power (W)": "80 W",
              "Ignition Time (s)": "9.2 s",
              "Burn Time (s)": "Insignificant",
              "Flow Direction": "Concurrent",
              "?-g Burn Length": "~ 0",
              "?-g Spread Length": "n/a",
              "1-g Burn Length": "Complete",
              "1-g Spread Rate": "Acceleratory",
              "Camera 1": "S1C1",
              "Camera 2": "S1C2"
            },
            {
              "Sample Number": "2-2",
              "Material": "Silicone",
              "Samle Thickness": "0.61 mm",
              "Sample Length": "29 cm",
              "Sample Width (cm)": "5 cm",
              "Air Flow (cm/s)": "20 cm/s",
              "Percent O2 (Note 1)": "~ 22.1",
              "Ignition Power (W)": "80 W",
              "Ignition Time (s)": "9.2 s",
              "Burn Time (s)": "Insignificant",
              "Flow Direction": "Concurrent",
              "?-g Burn Length": "~ 0",
              "?-g Spread Length": "n/a",
              "1-g Burn Length": "7.6 cm",
              "1-g Spread Rate": "1.2 mm/s",
              "Camera 1": "n/a",
              "Camera 2": "S2C2"
            },
            {
              "Sample Number": "2-3",
              "Material": "Silicone",
              "Samle Thickness": "1.03 mm",
              "Sample Length": "29 cm",
              "Sample Width (cm)": "5 cm",
              "Air Flow (cm/s)": "20 cm/s",
              "Percent O2 (Note 1)": "~ 22.1",
              "Ignition Power (W)": "80 W",
              "Ignition Time (s)": "9.2 s",
              "Burn Time (s)": "Insignificant",
              "Flow Direction": "Concurrent",
              "?-g Burn Length": "~ 0",
              "?-g Spread Length": "n/a",
              "1-g Burn Length": "~ 0",
              "1-g Spread Rate": "n/a",
              "Camera 1": null,
              "Camera 2": "S3C2"
            },
            {
              "Sample Number": "2-4",
              "Material": "Silicone",
              "Samle Thickness": "037 mm",
              "Sample Length": "29 cm",
              "Sample Width (cm)": "5 cm",
              "Air Flow (cm/s)": "20 cm/s",
              "Percent O2 (Note 1)": "~ 22.1",
              "Ignition Power (W)": "80 W",
              "Ignition Time (s)": "9.2 s",
              "Burn Time (s)": "Insignificant",
              "Flow Direction": "Opposed",
              "?-g Burn Length": "~ 0",
              "?-g Spread Length": "n/a",
              "1-g Burn Length": "Complete",
              "1-g Spread Rate": "0.6 mm/s",
              "Camera 1": "S4C1",
              "Camera 2": "S4C1"
            },
            {
              "Sample Number": "2-5",
              "Material": "Cotton-Fiberglass (SIBAL)",
              "Samle Thickness": "037 mm",
              "Sample Length": "29 cm",
              "Sample Width (cm)": "5 cm",
              "Air Flow (cm/s)": "20 cm/s",
              "Percent O2 (Note 1)": "~ 22.1",
              "Ignition Power (W)": "80 W",
              "Ignition Time (s)": "9.2 s",
              "Burn Time (s)": "145 s",
              "Flow Direction": "Concurrent",
              "?-g Burn Length": "29 cm",
              "?-g Spread Length": "2.1 mm/s",
              "1-g Burn Length": "Complete",
              "1-g Spread Rate": "Acceleratory",
              "Camera 1": "S5C1",
              "Camera 2": "S5C2"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": "ction and referenced to initial O2 concentration reported by ISS.,,,,,,,,,,,,,,,, Note 2 The PMMA portion was completely consumed but the Nomex was not ignited",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": "urn Length,?-g Spread Length,1-g Burn Length,1-g Spread Rate,Camera 1,Camera 2 2-1,Silicone,0.27 mm,29 cm,5 cm,20 cm/s,~ 21.5,80 W,9.2 s,Insignificant,Concurre",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": "current,29 cm,2.6 mm/s,Complete,Acceleratory,S6C1,S56C2 2-7,PMMA & Nomex,0.85 and 0.37 mm,5 and 24 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,140 s,Concurrent,5 cm & 0",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": "significant,Opposed,~ 0,n/a,Complete,0.6 mm/s,S4C1,S4C1 2-5,Cotton-Fiberglass (SIBAL),037 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,145 s,Concurrent,29 cm,2.1 mm",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-fiberglass",
          "entityLabel": "Fiberglass",
          "entityType": "material",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": "cant,Opposed,~ 0,n/a,Complete,0.6 mm/s,S4C1,S4C1 2-5,Cotton-Fiberglass (SIBAL),037 mm,29 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,145 s,Concurrent,29 cm,2.1 mm/s,Comp",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "PSI-99_Experimental table_SAFFIRE-2.csv",
          "location": "document body",
          "context": ",29 cm,2.6 mm/s,Complete,Acceleratory,S6C1,S56C2 2-7,PMMA & Nomex,0.85 and 0.37 mm,5 and 24 cm,5 cm,20 cm/s,~ 22.1,80 W,9.2 s,140 s,Concurrent,5 cm & 0 (note 2",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "2-1,Silicone,0.27 mm,29 cm,5 cm,20 cm/s,~ 21.5,80 W,9.2 s,Insignificant,Concurrent,~ 0,n/a,Complete,Acceleratory,S1C1,S1C2",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-003/f009-PSI-99_Experimental table_SAFFIRE-2.csv",
      "extractedPath": "data/extracted/batches/B-20261112-003/f009.extract.json",
      "processingMs": 5
    }
  ],
  "totals": {
    "files": 9,
    "extracted": 9,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 9,
    "pages": 0,
    "chars": 2338,
    "tables": 9,
    "tableRows": 717,
    "equations": 0,
    "figures": 0,
    "entities": 31,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 3,
    "files": 20,
    "uniqueFiles": 20,
    "duplicateFiles": 0,
    "documents": 20,
    "pages": 0,
    "chars": 4896,
    "tables": 20,
    "tableRows": 1997,
    "equations": 0,
    "figures": 0,
    "mediaAssets": 0,
    "entities": 109,
    "errors": 0,
    "userConfirmedAllUploads": false,
    "lastBatchId": "B-20261112-003",
    "updatedAt": "2026-11-12T20:27:28.892Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261112-005.json', '{
  "batchId": "B-20261112-005",
  "receivedAt": "2026-11-12T20:59:17.112Z",
  "fileCount": 3,
  "files": [
    {
      "id": "f001",
      "name": "spacecraft-fire-safety-demonstration-saffire.pdf",
      "sizeBytes": 99155,
      "sha256": "4eed8a4d5bce284e8d9ec24b637b21fdbf4b1fbbaadb663da3b66ee89faecd5f",
      "kind": "pdf",
      "status": "extracted",
      "domain": "fire-safety",
      "text": {
        "chars": 5419,
        "pages": 2,
        "pageTexts": [
          {
            "page": 1,
            "chars": 2522,
            "preview": "Spacecraft Fire Safety Demonstration (Saffire) Creating a safe environment for astronauts is the number one priority for all crew missions. Aboard the space station, astronauts have been able to conduct small-scale fire"
          },
          {
            "page": 2,
            "chars": 2865,
            "preview": "Launched April 18, 2017 aboard Orbital ATK’s seventh contracted commercial resupply services mission for NASA. The third in the Saffire series, Saffire-III will test the same cotton-fiberglass blend that was burned in Sa"
          }
        ],
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261112-005/f001-spacecraft-fire-safety-demonstration-saffire.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-saffire",
          "entityLabel": "SAFFIRE",
          "entityType": "investigation",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "Spacecraft Fire Safety Demonstration (Saffire) Creating a safe environment for astronauts is the number one priority for all crew mission",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "its sixth contracted cargo resupply mission with NASA to the International Space Station in October 2016. This second experiment in the Spacecraft Fire Safety s",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cygnus",
          "entityLabel": "Cygnus cargo vehicle",
          "entityType": "facility",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "ammability limits in space. The experiments are ignited in a Cygnus cargo vehicle after it has completed its primary International Space Station supply mission,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "th. Spacecraft Fire Safety Understanding how fire behaves in microgravity, and how different materials propagate flames in space is immensely important for the",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "t kit include a cotton-fiberglass blend, Nomex, and the same acrylic glass that is used for spacecraft windows. After Cygnus departs the station, and before its",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "d of a flow duct and avionics bay. Inside the flow duct, the cotton-fiberglass blend burn sample measured 0.4 m wide by 1 meter long. When commanded by Orbital",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-fiberglass",
          "entityLabel": "Fiberglass",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "flow duct and avionics bay. Inside the flow duct, the cotton-fiberglass blend burn sample measured 0.4 m wide by 1 meter long. When commanded by Orbital ATK and",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 1",
          "context": "les in the experiment kit include a cotton-fiberglass blend, Nomex, and the same acrylic glass that is used for spacecraft windows. After Cygnus departs the sta",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-saffire",
          "entityLabel": "SAFFIRE",
          "entityType": "investigation",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "mercial resupply services mission for NASA. The third in the Saffire series, Saffire-III will test the same cotton-fiberglass blend that was burned in Saffire-I",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "affire-IV was ignited May 11, 2020, when Cygnus departed the International Space Station, before its destructive re-entry through Earth’s atmosphere. This large",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cygnus",
          "entityLabel": "Cygnus cargo vehicle",
          "entityType": "facility",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "higher flow velocity. Saffire-III will be ignited after the Cygnus module departs the space station in early June, before its destructive entry through Earth’s",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-lunar",
          "entityLabel": "Lunar / Moon environment",
          "entityType": "mission-environment",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "in space, especially aboard future spacecraft bound for the Moon and Mars. During the Saffire IV experiment, researchers burned a sample of SIBAL cloth, a comp",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-mars",
          "entityLabel": "Mars environment",
          "entityType": "mission-environment",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": ", especially aboard future spacecraft bound for the Moon and Mars. During the Saffire IV experiment, researchers burned a sample of SIBAL cloth, a composite of",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "third in the Saffire series, Saffire-III will test the same cotton-fiberglass blend that was burned in Saffire-I, but at a higher flow velocity. Saffire-III wi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-fiberglass",
          "entityLabel": "Fiberglass",
          "entityType": "material",
          "source": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "location": "page/slide 2",
          "context": "in the Saffire series, Saffire-III will test the same cotton-fiberglass blend that was burned in Saffire-I, but at a higher flow velocity. Saffire-III will be i",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Spacecraft Fire Safety Demonstration (Saffire)",
        "titleConfidence": "medium",
        "years": [
          2016,
          2017,
          2020
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [
        {
          "path": "data/media/batches/B-20261112-005/f001-pdfimg01.png",
          "kind": "extracted-figure",
          "sourceFile": "spacecraft-fire-safety-demonstration-saffire.pdf",
          "width": 155,
          "height": 155,
          "format": "png",
          "page": 1,
          "interpretationError": "Configuration file not found or invalid. Please create .z-ai-config in your project, home directory, or /etc."
        }
      ],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-005/f001-spacecraft-fire-safety-demonstration-saffire.pdf",
      "extractedPath": "data/extracted/batches/B-20261112-005/f001.extract.json",
      "processingMs": 685
    },
    {
      "id": "f002",
      "name": "structure-liftoff-in-combustion-experiment-slice.pdf",
      "sizeBytes": 82627,
      "sha256": "ddc56bd4a9bf46d582fd00e6aed4fbe7c362c1aa6e35a857925fdf7d5a7bc36a",
      "kind": "pdf",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 5610,
        "pages": 2,
        "pageTexts": [
          {
            "page": 1,
            "chars": 2938,
            "preview": "Structure & Liftoff in Combustion Experiment (SLICE) laminar diffusion flames are especially valuable for studies of combustion because of the availability of accurate numerical modeling with that flame configuration. In"
          },
          {
            "page": 2,
            "chars": 2640,
            "preview": "The experimental hardware for the Smoke Points In Co-flow Experiment (SPICE), of David L. Urban (NASA Glenn) and Peter B. Sunderland (U. Maryland), which is currently onboard the International Space Station, was built to"
          }
        ],
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261112-005/f002-structure-liftoff-in-combustion-experiment-slice.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-spice",
          "entityLabel": "SPICE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "lew as part of the STS-87 mission. The SLICE experiment uses SPICE hardware which was based directly on the earlier ELF hardware. Compared to ELF, the SLICE exp",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-slice",
          "entityLabel": "SLICE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "Structure & Liftoff in Combustion Experiment (SLICE) laminar diffusion flames are especially valuable for studies of combustion because of the av",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "art of the Advanced Combustion via Microgravity Experiments (ACME) project. The overall goal of the proposed study is to improve our understanding of the physic",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "d value of such studies, the Coflow Laminar Diffusion Flame (CLD Flame) experiment of Marshall B. Long and Mitchell D. Smooke (both of Yale U.) is currently in",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "t for conduct in the Combustion Integrated Rack (CIR) on the International Space Station, as part of the Advanced Combustion via Microgravity Experiments (ACME)",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "h of Yale U.) is currently in development for conduct in the Combustion Integrated Rack (CIR) on the International Space Station, as part of the Advanced Combus",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "ntrols the stability of the entire trailing diffusion flame. Microgravity testing allows for greater temporal and spatial scales and a broader range of flame ch",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "are. Compared to ELF, the SLICE experiment provides superior imaging and a much wider variety of test conditions.",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 1",
          "context": "the CLD Flame experiment. Objectives For diffusion flames of methane, ethylene, and selected nitrogen dilutions of each fuel burning in a coflow of air: (1) Cha",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-spice",
          "entityLabel": "SPICE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "imental hardware for the Smoke Points In Co-flow Experiment (SPICE), of David L. Urban (NASA Glenn) and Peter B. Sunderland (U. Maryland), which is currently on",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-slice",
          "entityLabel": "SLICE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "the hardware can be used without modification to conduct the SLICE experiment. In terms of the experimental hardware, the only additional requirements for SLICE",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "PICE nozzles are all smaller than the nozzle planned for the CLD Flame experiment. Of course, the SLICE testing could most benefit the CLD Flame experiment by b",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-flare",
          "entityLabel": "FLARE",
          "entityType": "investigation",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "he left may look like attached flames, the outward fuel-lean flare of each flame’s base reveals it’s lifted nature. SLICE Contacts Project Manager: Robert Hawer",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "w laminar diffusion flames. The SPICE hardware is within the ISS MSG in the image to the right. While the SPICE investigation has been specifically focused on a",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "location": "page/slide 2",
          "context": "minar diffusion flames. The SPICE hardware is within the ISS MSG in the image to the right. While the SPICE investigation has been specifically focused on a stu",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Structure & Liftoff in Combustion Experiment (SLICE)",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [
        {
          "path": "data/media/batches/B-20261112-005/f002-pdfimg01.png",
          "kind": "extracted-figure",
          "sourceFile": "structure-liftoff-in-combustion-experiment-slice.pdf",
          "width": 155,
          "height": 155,
          "format": "png",
          "page": 1,
          "interpretationError": "Configuration file not found or invalid. Please create .z-ai-config in your project, home directory, or /etc."
        }
      ],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-005/f002-structure-liftoff-in-combustion-experiment-slice.pdf",
      "extractedPath": "data/extracted/batches/B-20261112-005/f002.extract.json",
      "processingMs": 655
    },
    {
      "id": "f003",
      "name": "20050215648.pdf",
      "sizeBytes": 156615,
      "sha256": "4d0e2f9817837c0382ca99fa1bc86777e358188eaad31666749e5998f0779849",
      "kind": "pdf",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 5775,
        "pages": 3,
        "pageTexts": [
          {
            "page": 1,
            "chars": 1997,
            "preview": "Fundamental Research Applied To Enable Hardware Performance in Microgravity NASA sponsors microgravity research to generate knowledge in physical sciences. In some cases, that knowledge must be applied to enable future r"
          },
          {
            "page": 2,
            "chars": 2137,
            "preview": "P-Trak internal components and flow. Long description of figure. Internal components and airflow for the P-Trak, showing pump, focusing optics, laser diode, photodetector, saturator tube, alcohol-soaked wick, and sample"
          },
          {
            "page": 3,
            "chars": 1593,
            "preview": "instruments, the smallest particles will be removed from the flow stream by a device called the DAFT Impactor, which was designed with the guidance of scientists at the National Institute of Standards and Technology. The"
          }
        ],
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261112-005/f003-20050215648.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "inv-same",
          "entityLabel": "SAME",
          "entityType": "investigation",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "Center by NASA and ZIN Technologies, Inc., in support of the Smoke Aerosol Measurement Experiment (SAME). SAME is an investigation that is being designed for op",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-daft",
          "entityLabel": "DAFT",
          "entityType": "investigation",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "example. The Dust and Aerosol measurement Feasibility Test (DAFT) is a risk-mitigation experiment developed at the NASA Glenn Research Center by NASA and ZIN T",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "or operation in the Microgravity Science Glovebox aboard the International Space Station (ISS). The purpose of DAFT is to evaluate the performance of P-Trak (TS",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "an investigation that is being designed for operation in the Microgravity Science Glovebox aboard the International Space Station (ISS). The purpose of DAFT is",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "ndamental Research Applied To Enable Hardware Performance in Microgravity NASA sponsors microgravity research to generate knowledge in physical sciences. In som",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "20050215648.pdf",
          "location": "page/slide 1",
          "context": "droplets pass through an internal nozzle and past a focused laser beam, producing flashes of light that are sensed by a photodetector and then counted to deter",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-daft",
          "entityLabel": "DAFT",
          "entityType": "investigation",
          "source": "20050215648.pdf",
          "location": "page/slide 2",
          "context": "wetting properties of liquids on surfaces (ref. 1). For the DAFT experiment, both a modified and an unmodified version of the P-Trak will be tested in the long",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "20050215648.pdf",
          "location": "page/slide 2",
          "context": "sted in the long-duration microgravity conditions aboard the ISS. In addition to the P-Traks, another commercial instrument, the TSI DustTrak, will be utilized",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "20050215648.pdf",
          "location": "page/slide 2",
          "context": "ed version of the P-Trak will be tested in the long-duration microgravity conditions aboard the ISS. In addition to the P-Traks, another commercial instrument,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "20050215648.pdf",
          "location": "page/slide 2",
          "context": "s and airflow for the P-Trak, showing pump, focusing optics, laser diode, photodetector, saturator tube, alcohol-soaked wick, and sample inlet. Also shows a cro",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-daft",
          "entityLabel": "DAFT",
          "entityType": "investigation",
          "source": "20050215648.pdf",
          "location": "page/slide 3",
          "context": "will be removed from the flow stream by a device called the DAFT Impactor, which was designed with the guidance of scientists at the National Institute of Stan",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "20050215648.pdf",
          "location": "page/slide 3",
          "context": "k. These instruments also will take data from samples of the ISS cabin air. Environmental Control and Life Support Systems personnel at the NASA Johnson Space C",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "20050215648.pdf",
          "location": "page/slide 3",
          "context": "2003, pp. 481–489. Find out more about this research http://microgravity.grc.nasa.gov/combustion/daft/daft_index.htm Glenn contacts: William A. Sheredy, 216–43",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Fundamental Research Applied To",
        "titleConfidence": "medium",
        "years": [
          2003
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [
        {
          "path": "data/media/batches/B-20261112-005/f003-pdfimg01.png",
          "kind": "extracted-figure",
          "sourceFile": "20050215648.pdf",
          "width": 403,
          "height": 306,
          "format": "png",
          "page": 2,
          "interpretationError": "Configuration file not found or invalid. Please create .z-ai-config in your project, home directory, or /etc."
        }
      ],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261112-005/f003-20050215648.pdf",
      "extractedPath": "data/extracted/batches/B-20261112-005/f003.extract.json",
      "processingMs": 656
    }
  ],
  "totals": {
    "files": 3,
    "extracted": 3,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 3,
    "pages": 7,
    "chars": 16804,
    "tables": 0,
    "tableRows": 0,
    "equations": 0,
    "figures": 3,
    "entities": 43,
    "newEntities": 0,
    "mediaAssets": 3
  },
  "cumulative": {
    "batches": 5,
    "files": 33,
    "uniqueFiles": 33,
    "duplicateFiles": 0,
    "documents": 33,
    "pages": 71,
    "chars": 132392,
    "tables": 23,
    "tableRows": 2007,
    "equations": 1,
    "figures": 64,
    "mediaAssets": 64,
    "entities": 110,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261112-005",
    "updatedAt": "2026-11-12T20:59:19.131Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-001.json', '{
  "batchId": "B-20261113-001",
  "receivedAt": "2026-11-13T15:13:17.001Z",
  "fileCount": 2,
  "files": [
    {
      "id": "f001",
      "name": "PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
      "sizeBytes": 7111,
      "sha256": "c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a",
      "kind": "csv",
      "status": "extracted",
      "domain": "fluid-physics",
      "text": {
        "chars": 228,
        "headings": [
          "PSI-108_PSI-108_Experimental_table_STDCE-1.csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261113-001/f001-PSI-108_PSI-108_Experimental_table_STDCE-1.txt"
      },
      "tables": [
        {
          "name": "PSI-108_PSI-108_Experimental_table_STDCE-1",
          "columns": [
            "Run#",
            "Test#",
            "Configuration",
            "Heating Mode",
            "Free Surface Shape",
            "Power (W)",
            "Laser Diameter (cm)",
            "Results",
            "Key Observations & References"
          ],
          "rowCount": 38,
          "sample": [
            {
              "Run#": 1,
              "Test#": "CF1",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 0.48,
              "Laser Diameter (cm)": 1,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow structure, rapid establishment of steady state, good agreement with numerical predictions. (Appendix A)"
            },
            {
              "Run#": 1,
              "Test#": "CF2",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.07,
              "Laser Diameter (cm)": 1,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"
            },
            {
              "Run#": 1,
              "Test#": "CF3",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.1,
              "Laser Diameter (cm)": 3,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"
            },
            {
              "Run#": 1,
              "Test#": "CF4",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 0.31,
              "Laser Diameter (cm)": 5,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"
            },
            {
              "Run#": 1,
              "Test#": "CF5",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.05,
              "Laser Diameter (cm)": 5,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
          "location": "document body",
          "context": "est#,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References 1,CF1,CF,CO2 Laser,Flat,0.48,1,Stable th",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Run#,Test#,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-001/f001-PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
      "extractedPath": "data/extracted/batches/B-20261113-001/f001.extract.json",
      "processingMs": 42
    },
    {
      "id": "f002",
      "name": "PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv",
      "sizeBytes": 6601,
      "sha256": "9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7",
      "kind": "csv",
      "status": "extracted",
      "domain": "fluid-physics",
      "text": {
        "chars": 229,
        "headings": [
          "PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv"
        ],
        "fullTextPath": "data/extracted/batches/B-20261113-001/f002-PSI-108_PSI-108_Experimental_table_STDCE-1(1).txt"
      },
      "tables": [
        {
          "name": "PSI-108_PSI-108_Experimental_table_STDCE-1(1)",
          "columns": [
            "Run",
            "Test",
            "Configuration",
            "Heating Mode",
            "Free Surface Shape",
            "Power (W)",
            "Laser Diameter (cm)",
            "Results",
            "Key Observations & References"
          ],
          "rowCount": 38,
          "sample": [
            {
              "Run": 1,
              "Test": "CF1",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 0.48,
              "Laser Diameter (cm)": 1,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow structure. rapid establishment of steady state. good agreement with numerical predictions."
            },
            {
              "Run": 1,
              "Test": "CF2",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.07,
              "Laser Diameter (cm)": 1,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."
            },
            {
              "Run": 1,
              "Test": "CF3",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.1,
              "Laser Diameter (cm)": 3,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."
            },
            {
              "Run": 1,
              "Test": "CF4",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 0.31,
              "Laser Diameter (cm)": 5,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."
            },
            {
              "Run": 1,
              "Test": "CF5",
              "Configuration": "CF",
              "Heating Mode": "CO2 Laser",
              "Free Surface Shape": "Flat",
              "Power (W)": 2.05,
              "Laser Diameter (cm)": 5,
              "Results": "Stable thermocapillary flow",
              "Key Observations & References": "Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."
            }
          ],
          "location": "line 1 (header)"
        }
      ],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": []
      },
      "entities": [
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv",
          "location": "document body",
          "context": "Test,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References 1,CF1,CF,CO2 Laser,Flat,0.48,1,Stable th",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "Run,Test,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References",
        "titleConfidence": "medium",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-001/f002-PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv",
      "extractedPath": "data/extracted/batches/B-20261113-001/f002.extract.json",
      "processingMs": 29
    }
  ],
  "totals": {
    "files": 2,
    "extracted": 2,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 2,
    "pages": 0,
    "chars": 457,
    "tables": 2,
    "tableRows": 76,
    "equations": 0,
    "figures": 0,
    "entities": 2,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 8,
    "files": 52,
    "uniqueFiles": 52,
    "duplicateFiles": 0,
    "documents": 52,
    "pages": 432,
    "chars": 835122,
    "tables": 44,
    "tableRows": 2223,
    "equations": 155,
    "figures": 468,
    "mediaAssets": 216,
    "entities": 115,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261113-001",
    "updatedAt": "2026-11-13T15:13:17.172Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-001.state.json', '{"version":1,"batchId":"B-20261113-001","receivedAt":"2026-11-13T15:13:17.001Z","uploads":[{"name":"PSI-108_PSI-108_Experimental_table_STDCE-1.csv","sha256":"c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a","sizeBytes":7111},{"name":"PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv","sha256":"9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7","sizeBytes":6601}],"uploadsDone":[0,1],"records":{"f001":{"id":"f001","name":"PSI-108_PSI-108_Experimental_table_STDCE-1.csv","sizeBytes":7111,"sha256":"c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a","kind":"csv","status":"extracted","domain":"fluid-physics","text":{"chars":228,"headings":["PSI-108_PSI-108_Experimental_table_STDCE-1.csv"],"fullTextPath":"data/extracted/batches/B-20261113-001/f001-PSI-108_PSI-108_Experimental_table_STDCE-1.txt"},"tables":[{"name":"PSI-108_PSI-108_Experimental_table_STDCE-1","columns":["Run#","Test#","Configuration","Heating Mode","Free Surface Shape","Power (W)","Laser Diameter (cm)","Results","Key Observations & References"],"rowCount":38,"sample":[{"Run#":1,"Test#":"CF1","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":0.48,"Laser Diameter (cm)":1,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow structure, rapid establishment of steady state, good agreement with numerical predictions. (Appendix A)"},{"Run#":1,"Test#":"CF2","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.07,"Laser Diameter (cm)":1,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"},{"Run#":1,"Test#":"CF3","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.1,"Laser Diameter (cm)":3,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"},{"Run#":1,"Test#":"CF4","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":0.31,"Laser Diameter (cm)":5,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"},{"Run#":1,"Test#":"CF5","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.05,"Laser Diameter (cm)":5,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow, no secondary flows observed, velocity field becomes steady within minutes. (Appendix C)"}],"location":"line 1 (header)"}],"equations":{"matchedKnown":[],"heuristicFormulas":[],"doiLike":[]},"entities":[{"entityId":"sen-laser","entityLabel":"Laser diagnostics","entityType":"sensor","source":"PSI-108_PSI-108_Experimental_table_STDCE-1.csv","location":"document body","context":"est#,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References 1,CF1,CF,CO2 Laser,Flat,0.48,1,Stable th","evidence":"dictionary-match"}],"publication":{"title":"Run#,Test#,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References","titleConfidence":"medium","years":[],"authorConfidence":"low","note":"title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"},"media":[],"errors":[],"unresolved":[],"rawPath":"data/raw/batches/B-20261113-001/f001-PSI-108_PSI-108_Experimental_table_STDCE-1.csv","extractedPath":"data/extracted/batches/B-20261113-001/f001.extract.json","processingMs":42},"f002":{"id":"f002","name":"PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv","sizeBytes":6601,"sha256":"9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7","kind":"csv","status":"extracted","domain":"fluid-physics","text":{"chars":229,"headings":["PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv"],"fullTextPath":"data/extracted/batches/B-20261113-001/f002-PSI-108_PSI-108_Experimental_table_STDCE-1(1).txt"},"tables":[{"name":"PSI-108_PSI-108_Experimental_table_STDCE-1(1)","columns":["Run","Test","Configuration","Heating Mode","Free Surface Shape","Power (W)","Laser Diameter (cm)","Results","Key Observations & References"],"rowCount":38,"sample":[{"Run":1,"Test":"CF1","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":0.48,"Laser Diameter (cm)":1,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow structure. rapid establishment of steady state. good agreement with numerical predictions."},{"Run":1,"Test":"CF2","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.07,"Laser Diameter (cm)":1,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."},{"Run":1,"Test":"CF3","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.1,"Laser Diameter (cm)":3,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."},{"Run":1,"Test":"CF4","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":0.31,"Laser Diameter (cm)":5,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."},{"Run":1,"Test":"CF5","Configuration":"CF","Heating Mode":"CO2 Laser","Free Surface Shape":"Flat","Power (W)":2.05,"Laser Diameter (cm)":5,"Results":"Stable thermocapillary flow","Key Observations & References":"Unicellular flow. no secondary flows observed. velocity field becomes steady within minutes."}],"location":"line 1 (header)"}],"equations":{"matchedKnown":[],"heuristicFormulas":[],"doiLike":[]},"entities":[{"entityId":"sen-laser","entityLabel":"Laser diagnostics","entityType":"sensor","source":"PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv","location":"document body","context":"Test,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References 1,CF1,CF,CO2 Laser,Flat,0.48,1,Stable th","evidence":"dictionary-match"}],"publication":{"title":"Run,Test,Configuration,Heating Mode,Free Surface Shape,Power (W),Laser Diameter (cm),Results,Key Observations & References","titleConfidence":"medium","years":[],"authorConfidence":"low","note":"title taken from the first substantial line of the text layer (medium confidence); no DOI pattern found; no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"},"media":[],"errors":[],"unresolved":[],"rawPath":"data/raw/batches/B-20261113-001/f002-PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv","extractedPath":"data/extracted/batches/B-20261113-001/f002.extract.json","processingMs":29}},"childOrder":{},"registryAdds":{"c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a":{"sha256":"c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a","firstSeenBatch":"B-20261113-001","firstSeenName":"PSI-108_PSI-108_Experimental_table_STDCE-1.csv","firstSeenAt":"2026-11-13T15:13:17.043Z","sizeBytes":7111,"kind":"csv"},"9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7":{"sha256":"9d403958984512828ade3110691f7bfc5ba1c704ef42b1093edb7fec1e2df9c7","firstSeenBatch":"B-20261113-001","firstSeenName":"PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv","firstSeenAt":"2026-11-13T15:13:17.104Z","sizeBytes":6601,"kind":"csv"}},"visionUsed":0,"updatedAt":"2026-11-13T15:13:17.121Z"}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-002.json', '{
  "batchId": "B-20261113-002",
  "receivedAt": "2026-11-13T15:13:47.974Z",
  "fileCount": 1,
  "files": [
    {
      "id": "f001",
      "name": "PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
      "sizeBytes": 7111,
      "sha256": "c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a",
      "kind": "csv",
      "status": "duplicate",
      "domain": "other",
      "duplicateOf": {
        "batchId": "B-20261113-001",
        "name": "PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
        "sha256": "c883ab3bc89cadf870d97b0f5d9c533119e1827d788deb0f6e28e59317a8535a"
      },
      "tables": [],
      "entities": [],
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-002/f001-PSI-108_PSI-108_Experimental_table_STDCE-1.csv",
      "processingMs": 6
    }
  ],
  "totals": {
    "files": 1,
    "extracted": 0,
    "duplicates": 1,
    "unsupported": 0,
    "failed": 0,
    "documents": 0,
    "pages": 0,
    "chars": 0,
    "tables": 0,
    "tableRows": 0,
    "equations": 0,
    "figures": 0,
    "entities": 0,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 9,
    "files": 53,
    "uniqueFiles": 52,
    "duplicateFiles": 1,
    "documents": 52,
    "pages": 432,
    "chars": 835122,
    "tables": 44,
    "tableRows": 2223,
    "equations": 155,
    "figures": 468,
    "mediaAssets": 216,
    "entities": 115,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261113-002",
    "updatedAt": "2026-11-13T15:13:47.998Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-003.json', '{
  "batchId": "B-20261113-003",
  "receivedAt": "2026-11-13T15:15:15.519Z",
  "fileCount": 10,
  "files": [
    {
      "id": "f001",
      "name": "PSI-10_record.txt",
      "sizeBytes": 3069,
      "sha256": "d35934fede1835e4ef4d3e487edbf0f554ee527d0591191d19fc2bbab18dafdd",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3067,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f001-PSI-10_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/w4zy-bt45"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "{\"Name\": \"Advanced Combustion via Microgravity Experiments (ACME) Combustion Integrated Rack (CIR) Reconfiguration of Combustion Integrated Rack (CIR)\", \"Lin",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-flamedesign",
          "entityLabel": "Flame Design",
          "entityType": "investigation",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "10 TITLE: Advanced Combustion via Microgravity Experiments / Flame Design SHORT LABEL: RESEARCH AREA: Combustion Science / Flames of Gaseous Fuels PROJECT TYPE",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/w4zy-bt45 | SOURCE: KEYWORDS: c, h, e, m, i, c, a,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "\": \"Advanced Combustion via Microgravity Experiments (ACME) Combustion Integrated Rack (CIR) Reconfiguration of Combustion Integrated Rack (CIR)\", \"Link\": \"ht",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "INVESTIGATION RECORD — PSI-10 TITLE: Advanced Combustion via Microgravity Experiments / Flame Design SHORT LABEL: RESEARCH AREA: Combustion Science / Flames of",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-pmt",
          "entityLabel": "Photomultiplier tube",
          "entityType": "sensor",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "serve the flames with a broad suite of cameras, radiometers, photomultiplier tubes, and thermocouples. HYPOTHESIS: 1. Soot formation requires a region where loc",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-10_record.txt",
          "location": "document body",
          "context": "Zst, amount of inert (N2 or CO2), and pressure for C2H4 and CH4 flames. Identify the corresponding temperatures in hot regions. Obtain similar limits and tempe",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-10",
        "titleConfidence": "medium",
        "doi": "10.60555/w4zy-bt45",
        "years": [
          2017
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f001-PSI-10_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f001.extract.json",
      "processingMs": 48
    },
    {
      "id": "f002",
      "name": "PSI-20_record.txt",
      "sizeBytes": 6223,
      "sha256": "c62fbfb1e55bbc9534994d30680c4e472ecfdd0101b5a4b96c9dd7af786edf02",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 6217,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f002-PSI-20_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/vb93-3y72"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": "urner. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-fcf/cir/ https://www1.grc.nasa.go",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/vb93-3y72 | SOURCE: KEYWORDS: B, u, o, y, a, n, c,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": "ity flames observed with the BRE burner. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": "INVESTIGATION RECORD — PSI-20 TITLE: Advanced Combustion via Microgravity Experiments - Burning Rate Emulator SHORT LABEL: RESEARCH AREA: Combustion Science /",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": "corresponding to various condensed-phase materials (such as PMMA and Nylon) was observed in microgravity despite the absence of air flow, where the cessation o",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-20_record.txt",
          "location": "document body",
          "context": ". Observe burning behavior in long-duration microgravity for CH4/N2 and C2H4/N2mixtures on porous circular burners of 25 and 50 mm diameter. Consider O2/N2 amb",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-20",
        "titleConfidence": "medium",
        "doi": "10.60555/vb93-3y72",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f002-PSI-20_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f002.extract.json",
      "processingMs": 165
    },
    {
      "id": "f003",
      "name": "PSI-21_record.txt",
      "sizeBytes": 5553,
      "sha256": "0fb2f4269e5c4316a90044f76e44fb911ca29495d9567b0b3492c9869c2c0255",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 5547,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f003-PSI-21_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/23e1-9950",
          "10.1088/1364-7830/8/3/009",
          "10.1016/S0010-2180(00",
          "10.1016/S0082-0784(00",
          "10.1016/S0082-0784(98"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "ity, soot temperatures, and soot volume fractions. APPROACH: ACME CLD Flame project goals include the generation of improved computational models with improved",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "soot temperatures, and soot volume fractions. APPROACH: ACME CLD Flame project goals include the generation of improved computational models with improved soot",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/23e1-9950 | SOURCE: KEYWORDS: m, i, c, r, o, g, r,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "try under momentum-dominated conditions. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "INVESTIGATION RECORD — PSI-21 TITLE: Advanced Combustion via Microgravity Experiments / Coflow Laminar Diffusion Flame SHORT LABEL: RESEARCH AREA: Combustion S",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "l-rich flames will be investigated using soot luminosity and laser extinction measurements to determine soot temperatures and soot volume fractions. Flame tempe",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-21_record.txt",
          "location": "document body",
          "context": "Characterize the behavior of weak coflow diffusion flames of methane and ethylene, as a function of velocity and fuel dilution, through measurement of flame sha",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-21",
        "titleConfidence": "medium",
        "doi": "10.60555/23e1-9950",
        "years": [
          1973,
          1979,
          1998,
          2000,
          2004
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f003-PSI-21_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f003.extract.json",
      "processingMs": 23
    },
    {
      "id": "f004",
      "name": "PSI-22_record.txt",
      "sizeBytes": 4685,
      "sha256": "e63054fcf6eafe0ba457adac96e5a131c30591f8c070c7a33631d5eef64b2a42",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 4681,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f004-PSI-22_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/se5a-8c73"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "sions. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-fcf/cir/ https://www1.grc.nasa.go",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-efield",
          "entityLabel": "E-FIELD Flames",
          "entityType": "investigation",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "racterize stabilized near-limit lifted flames. APPROACH: The E-FIELD flames experiment investigates how electric fields influence the behavior of laminar diffus",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/se5a-8c73 | SOURCE: KEYWORDS: M, e, t, h, a, n, e,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "ame radiant emissions. All experiments were conducted in the combustion integrated rack (CIR). Tests were administered with Glenn Research Center (GRC) directin",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "INVESTIGATION RECORD — PSI-22 TITLE: Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames SHORT LABEL: RESEARCH",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "red flame shape, luminosity, and soot distribution. Spectral imaging with filters measures chemiluminescent emissions and soot volume fraction. There were therm",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-22_record.txt",
          "location": "document body",
          "context": "iving ion-driving convection and influencing flame behavior. Methane and ethylene were used as fuels and diluted with nitrogen to control flame strength. Diluti",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-22",
        "titleConfidence": "medium",
        "doi": "10.60555/se5a-8c73",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f004-PSI-22_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f004.extract.json",
      "processingMs": 10
    },
    {
      "id": "f005",
      "name": "PSI-23_record.txt",
      "sizeBytes": 5206,
      "sha256": "de0a597b0801ce9f1d7f01795531e7ba3b6bf88e9336873f75f464d296818dba",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 5200,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f005-PSI-23_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [
          {
            "id": "lewis-number",
            "name": "Lewis number",
            "where": "page/slide 1"
          }
        ],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/k57n-p030"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "eters. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-fcf/cir/ https://www1.grc.nasa.go",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-sflame",
          "entityLabel": "s-Flame",
          "entityType": "investigation",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "on) of diffusion flames established at initially non-steady, spherical flame structures for mixtures of different H2/CH4/diluent ratios (soot-free) and differ",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/k57n-p030 | SOURCE: KEYWORDS: A, c, t, i, v, a, t,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "associated physico-chemical parameters. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) ACME\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "INVESTIGATION RECORD — PSI-23 TITLE: Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames SHORT LABEL: RESEARC",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "f the flames. Conventional gaseous fuels including hydrogen, methane, and ethylene will be used. Hydrogen is the simplest fuel and its reaction mechanism is als",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-hydrogen",
          "entityLabel": "Hydrogen",
          "entityType": "fuel",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "ulations of the flames. Conventional gaseous fuels including hydrogen, methane, and ethylene will be used. Hydrogen is the simplest fuel and its reaction mechan",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-co2",
          "entityLabel": "Carbon dioxide (suppressant)",
          "entityType": "suppressant",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "ude nitrogen and helium to adjust mixture diffusivities, and carbon dioxide to influence flame radiation characteristics. HYPOTHESIS: The transient numerical si",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-he",
          "entityLabel": "Helium (diluent)",
          "entityType": "suppressant",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "arbons. Diluents mixed with fuel are to include nitrogen and helium to adjust mixture diffusivities, and carbon dioxide to influence flame radiation characteris",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "eq-lewis-number",
          "entityLabel": "Lewis number",
          "entityType": "equation",
          "source": "PSI-23_record.txt",
          "location": "document body",
          "context": "flames using fuel/diluent mixtures that are above a critical Lewis number. APPROACH: A series of experiments is proposed in which mixtures of various gaseous fu",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-23",
        "titleConfidence": "medium",
        "doi": "10.60555/k57n-p030",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f005-PSI-23_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f005.extract.json",
      "processingMs": 19
    },
    {
      "id": "f006",
      "name": "PSI-25_record.txt",
      "sizeBytes": 3836,
      "sha256": "6b8370495c85a6b6c0a00b7c0980b02d22242a1d0904d7716571fc083e8718ad",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3820,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f006-PSI-25_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/4qc4-de67"
        ]
      },
      "entities": [
        {
          "entityId": "inv-bass",
          "entityLabel": "BASS",
          "entityType": "investigation",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "NASA PSI INVESTIGATION RECORD — PSI-25 TITLE: Burning and Suppression of Solids - II SHORT LABEL: RESEARCH AREA: Combustion Science / Spacecraft",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-bass2",
          "entityLabel": "BASS-II",
          "entityType": "investigation",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": ", , , , , , F, i, r, e, , S, a, f, e, t, y OBJECTIVES: BASS-II results contribute to the combustion computational models used in the design of fire detect",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-sofie",
          "entityLabel": "SoFIE",
          "entityType": "investigation",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "d actual material flammability in microgravity. 3) Provide SoFIE PIs with preliminary data to refine Science Requirements. 4) Practical, realistic (thicker",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/4qc4-de67 | SOURCE: KEYWORDS: F, l, a, m, e, , S,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "ab partner” operations. The wind tunnel was installed in the Microgravity Science Glovebox which supplied power, imaging, and a level of containment. Fuel sampl",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/4qc4-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "d in the Microgravity Science Glovebox which supplied power, imaging, and a level of containment. Fuel samples were mounted inside a small wind tunnel which cou",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "std-nasa-std",
          "entityLabel": "NASA standard",
          "entityType": "standard",
          "source": "PSI-25_record.txt",
          "location": "document body",
          "context": "ity. 2) Begin to bridge the gap between the normal gravity NASA-STD-6001 Test #1 method, ground-based microgravity tests, and actual material flammability in",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-25",
        "titleConfidence": "medium",
        "doi": "10.60555/4qc4-de67",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f006-PSI-25_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f006.extract.json",
      "processingMs": 20
    },
    {
      "id": "f007",
      "name": "PSI-26_record.txt",
      "sizeBytes": 4442,
      "sha256": "e7dfda685d19414cd1ba115792c20cd74dec63e7ee3dad6ff917251b27b507ac",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 4430,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f007-PSI-26_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/58h4-dy80"
        ]
      },
      "entities": [
        {
          "entityId": "inv-bass",
          "entityLabel": "BASS",
          "entityType": "investigation",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "NASA PSI INVESTIGATION RECORD — PSI-26 TITLE: Burning and Suppression of Solids SHORT LABEL: RESEARCH AREA: Combustion Science / Spacecraft Fire",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/58h4-dy80 | SOURCE: KEYWORDS: F, l, a, m, e, , S,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "re the safety of future crewed missions. HARDWARE: {\"Name\": \"Microgravity Science Glovebox\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/msg/\"} RECOVE",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/58h4-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "love Box (MSG). Custom-made fabric samples consisting of 75% cotton and 25% fiberglass (by mass) measuring were used as a fuel source as well as Nomex fabric an",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-fiberglass",
          "entityLabel": "Fiberglass",
          "entityType": "material",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "Custom-made fabric samples consisting of 75% cotton and 25% fiberglass (by mass) measuring were used as a fuel source as well as Nomex fabric and Ultem. A Kant",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": "ss (by mass) measuring were used as a fuel source as well as Nomex fabric and Ultem. A Kanthal wire (29-gage)igniter was used to initiate combustion at one end",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "std-nasa-std",
          "entityLabel": "NASA standard",
          "entityType": "standard",
          "source": "PSI-26_record.txt",
          "location": "document body",
          "context": ": 1.) Begin to bridge the gap between the normal gravity NASA-STD-6001 Test#1 method, ground-based microgravity tests, and actual material flammability in m",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-26",
        "titleConfidence": "medium",
        "doi": "10.60555/58h4-dy80",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f007-PSI-26_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f007.extract.json",
      "processingMs": 63
    },
    {
      "id": "f008",
      "name": "PSI-39_record.txt",
      "sizeBytes": 4084,
      "sha256": "fad8926a2e0996b86addc4432bbc48a707c4da71a50bc717011db12d2cd3ff5d",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 4082,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f008-PSI-39_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/m6pj-a914"
        ]
      },
      "entities": [
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "NASA PSI INVESTIGATION RECORD — PSI-39 TITLE: Cool Flames Investigation SHORT LABEL: RESEARCH AREA: Combustion Science / Droplets PROJECT TYPE:",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/m6pj-a914 | SOURCE: KEYWORDS: D, r, o, p, l, e, t,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "f soot formation during cool flame combustion. APPROACH: The Combustion Integrated Rack (CIR) contains the Multi-User Droplet Combustion Apparatus (MDCA) which",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-mdca",
          "entityLabel": "MDCA",
          "entityType": "apparatus",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "(CIR) contains the Multi-User Droplet Combustion Apparatus (MDCA) which facilitates the controlled combustion of fuel droplets. A system of gas bottles and fue",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "RESEARCH AREA: Combustion Science / Droplets PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/m6pj-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "on and dynamics. Flames were observed with a black-and-white camera for droplet size measurements. A UV camera was used for capturing the OH* radical emissions",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-octane",
          "entityLabel": "n-Octane",
          "entityType": "fuel",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "ing an understanding of how cool flame reactivity determines octane and cetane number for fuels in spark ignition and diesel engines. Cool Flames Investigation",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-he",
          "entityLabel": "Helium (diluent)",
          "entityType": "suppressant",
          "source": "PSI-39_record.txt",
          "location": "document body",
          "context": "anging from 0.25 atm to 5 atm. 2) Analyze the effects of helium dilution on cool flame behavior. 3) Examine the behavior of combustion characteristics.",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-39",
        "titleConfidence": "medium",
        "doi": "10.60555/m6pj-a914",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f008-PSI-39_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f008.extract.json",
      "processingMs": 49
    },
    {
      "id": "f009",
      "name": "PSI-47_record.txt",
      "sizeBytes": 4076,
      "sha256": "eb7488eaddafabaebaa9106d76a083a934f9b15bc19969fce1d1a3a68d471c05",
      "kind": "txt",
      "status": "extracted",
      "domain": "aerosol-smoke",
      "text": {
        "chars": 4074,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f009-PSI-47_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/ztgj-d202"
        ]
      },
      "entities": [
        {
          "entityId": "inv-same",
          "entityLabel": "SAME",
          "entityType": "investigation",
          "source": "PSI-47_record.txt",
          "location": "document body",
          "context": "The focus of DAFT / DAFT-2 was to mitigate the risk for the Smoke Aerosol Measurement Experiment (SAME). SAME relied on a commercially available condensate nuc",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-daft",
          "entityLabel": "DAFT",
          "entityType": "investigation",
          "source": "PSI-47_record.txt",
          "location": "document body",
          "context": "e, , p, r, e, v, e, n, t, i, o, n OBJECTIVES: The focus of DAFT / DAFT-2 was to mitigate the risk for the Smoke Aerosol Measurement Experiment (SAME). SAME re",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-47_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/ztgj-d202 | SOURCE: KEYWORDS: D, A, F, T, , , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-47_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/ztgj-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-laser",
          "entityLabel": "Laser diagnostics",
          "entityType": "sensor",
          "source": "PSI-47_record.txt",
          "location": "document body",
          "context": "sopropanol around aerosol particulates that are subsequently laser counted. It was hypothesized that the P-Trak would not work in microgravity due to two potent",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-47",
        "titleConfidence": "medium",
        "doi": "10.60555/ztgj-d202",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f009-PSI-47_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f009.extract.json",
      "processingMs": 12
    },
    {
      "id": "f010",
      "name": "PSI-68_record.txt",
      "sizeBytes": 6680,
      "sha256": "1b562f16f85f306afde1daf5b3ed87dcf6d42281d9925ec7b0a88dff4b4fe80e",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 6678,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-003/f010-PSI-68_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/byp8-h018"
        ]
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": ", o, r, m, a, t, i, o, n OBJECTIVES: The primary goal of the FLEX-2 flight experiments is to extend the results of FLEX-1 to fuels and environmental conditions",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-flex2",
          "entityLabel": "FLEX-2",
          "entityType": "investigation",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": ", o, r, m, a, t, i, o, n OBJECTIVES: The primary goal of the FLEX-2 flight experiments is to extend the results of FLEX-1 to fuels and environmental conditions",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/byp8-h018 | SOURCE: KEYWORDS: F, L, E, X, , , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": "with support from prior droplet results. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR) Multi-user Droplet Combustion Appartatus (MDCA)\", \"Link\": \"https:",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-mdca",
          "entityLabel": "MDCA",
          "entityType": "apparatus",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": "grated Rack (CIR) Multi-user Droplet Combustion Appartatus (MDCA)\", \"Link\": \"https://issnationallab.org/facilities/combustion-integrated-rack/ https://gipoc.g",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/byp8-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-68_record.txt",
          "location": "document body",
          "context": "ignitor is retracted. A near real-time download of the color camera video was employed in order to verify successful droplet deployment, ignition, and overall p",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-68",
        "titleConfidence": "medium",
        "doi": "10.60555/byp8-h018",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-003/f010-PSI-68_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-003/f010.extract.json",
      "processingMs": 28
    }
  ],
  "totals": {
    "files": 10,
    "extracted": 10,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 10,
    "pages": 0,
    "chars": 47796,
    "tables": 0,
    "tableRows": 0,
    "equations": 1,
    "figures": 0,
    "entities": 73,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 10,
    "files": 63,
    "uniqueFiles": 62,
    "duplicateFiles": 1,
    "documents": 62,
    "pages": 432,
    "chars": 882918,
    "tables": 44,
    "tableRows": 2223,
    "equations": 156,
    "figures": 468,
    "mediaAssets": 216,
    "entities": 115,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261113-003",
    "updatedAt": "2026-11-13T15:15:16.515Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-004.json', '{
  "batchId": "B-20261113-004",
  "receivedAt": "2026-11-13T15:15:45.035Z",
  "fileCount": 10,
  "files": [
    {
      "id": "f001",
      "name": "PSI-69_record.txt",
      "sizeBytes": 6391,
      "sha256": "8bd211c886db1cdc45ae8414946ab4513cda9456706db90b30bbe2c8992d33e4",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 6385,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f001-PSI-69_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/mbq8-0451"
        ]
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "f, e, t, y, , , , , , F, l, a, m, e, s OBJECTIVES: The FLEX (Flame Extinguishment Experiment) investigation aims to map the flammability limits of liquid",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "byproducts during fire events. Additionally, the study of ''''cool flames'''' and low-temperature combustion processes observed in microgravity can inform the desi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/mbq8-0451 | SOURCE: KEYWORDS: F, L, E, X, , , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "nd terrestrial fire safety technologies. HARDWARE: {\"Name\": \"Combustion Integrated Rack (CIR)-Fluids and Combustion Facility (FCF) Multi-user Droplet Combustio",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-mdca",
          "entityLabel": "MDCA",
          "entityType": "apparatus",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "on Facility (FCF) Multi-user Droplet Combustion Appartatus (MDCA)\", \"Link\": \"https://issnationallab.org/facilities/combustion-integrated-rack/ https://gipoc.g",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-69_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/mbq8-",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-69",
        "titleConfidence": "medium",
        "doi": "10.60555/mbq8-0451",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f001-PSI-69_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f001.extract.json",
      "processingMs": 66
    },
    {
      "id": "f002",
      "name": "PSI-98_record.txt",
      "sizeBytes": 3935,
      "sha256": "4000a663ba84c409698d8cb5a6949024ee7b951bd315a2e5080005d5eb9df268",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3927,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f002-PSI-98_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/0t15-1z43"
        ]
      },
      "entities": [
        {
          "entityId": "inv-saffire",
          "entityLabel": "SAFFIRE",
          "entityType": "investigation",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "gravity material flammability screening test. APPROACH: The Saffire-1 experiments was performed on the Orbital Science’s Cygnus resupply vehicle after it deber",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/0t15-1z43 | SOURCE: KEYWORDS: C, y, g, n, u, s, ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "gnus\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/msg/saffire/\"} RECOVERED TABLES: (0 rows)",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cygnus",
          "entityLabel": "Cygnus cargo vehicle",
          "entityType": "facility",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "Saffire-1 experiments was performed on the Orbital Science’s Cygnus resupply vehicle after it deberthed from the ISS. The sample material for Saffire-I is a com",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "Science / Spacecraft Fire, Smoke Distribution PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/0t15-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-exploration",
          "entityLabel": "Exploration vehicle / habitat",
          "entityType": "mission-environment",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "xperiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instru",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-flow",
          "entityLabel": "Flow controller / anemometer",
          "entityType": "sensor",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "e used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked. HYPOTHESIS:",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "r Saffire-I is a composite fabric called Sibal consisting of cotton on a fiberglass substrate (75% cotton, 25% fiberglass by weight). It has been used in many s",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-fiberglass",
          "entityLabel": "Fiberglass",
          "entityType": "material",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "is a composite fabric called Sibal consisting of cotton on a fiberglass substrate (75% cotton, 25% fiberglass by weight). It has been used in many space experim",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-co2",
          "entityLabel": "Carbon dioxide (suppressant)",
          "entityType": "suppressant",
          "source": "PSI-98_record.txt",
          "location": "document body",
          "context": "igh. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame.",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-98",
        "titleConfidence": "medium",
        "doi": "10.60555/0t15-1z43",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f002-PSI-98_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f002.extract.json",
      "processingMs": 21
    },
    {
      "id": "f003",
      "name": "PSI-99_record.txt",
      "sizeBytes": 3942,
      "sha256": "14aa17693cc496694a66453deb18c7f086f384923fe89a8fa2d625d322c5535d",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3934,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f003-PSI-99_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/2chp-m469"
        ]
      },
      "entities": [
        {
          "entityId": "inv-saffire",
          "entityLabel": "SAFFIRE",
          "entityType": "investigation",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": ", s, t, r, i, b, u, t, i, o, n OBJECTIVES: The objectives of SAFFIRE-II are to determine how rapidly a large scale fire grows in low-gravity and to investigate",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "cience’s Cygnus resupply vehicle after it deberthed from the ISS. As a follow on to the Saffire-I investigation, the Saffire-II investigation added more samples",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cygnus",
          "entityLabel": "Cygnus cargo vehicle",
          "entityType": "facility",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: Cygnus Spacecraft DOI: 10.60555/2chp-m469 | SOURCE: KEYWORDS: f, i, r, e, , , , , , C, y, g,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "AREA: Combustion Science / Surface Combustion PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: Cygnus Spacecraft DOI: 10.60555/2chp-m469 | SOURCE:",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-exploration",
          "entityLabel": "Exploration vehicle / habitat",
          "entityType": "mission-environment",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "xperiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instru",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-flow",
          "entityLabel": "Flow controller / anemometer",
          "entityType": "sensor",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "e used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked. Details rel",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "tion added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex. The Saffire-1I flight unit had a sample card installed in the",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "n, the Saffire-II investigation added more samples including SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex. The Saffire-1I flight unit had a s",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-nomex",
          "entityLabel": "Nomex",
          "entityType": "material",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "ng SIBAL, silicone, structure PMMA, flat PMMA, and PMMA with Nomex. The Saffire-1I flight unit had a sample card installed in the middle of a large flow duct. A",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-co2",
          "entityLabel": "Carbon dioxide (suppressant)",
          "entityType": "suppressant",
          "source": "PSI-99_record.txt",
          "location": "document body",
          "context": "igh. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame.",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-99",
        "titleConfidence": "medium",
        "doi": "10.60555/2chp-m469",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f003-PSI-99_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f003.extract.json",
      "processingMs": 23
    },
    {
      "id": "f004",
      "name": "PSI-100_record.txt",
      "sizeBytes": 3586,
      "sha256": "825c4c4835be5275c9ecc97199b8a657cc5e0558c58dd49822bbb22883b3d9bc",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3578,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f004-PSI-100_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/040q-4h36"
        ]
      },
      "entities": [
        {
          "entityId": "inv-saffire",
          "entityLabel": "SAFFIRE",
          "entityType": "investigation",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "gravity material flammability screening test. APPROACH: The Saffire-III experiments were performed on the Orbital Science’s Cygnus resupply vehicle after it de",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/040q-4h36 | SOURCE: KEYWORDS: S, A, F, F, I, R, E,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "gnus\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/msg/saffire/\"} RECOVERED TABLES: (0 rows)",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cygnus",
          "entityLabel": "Cygnus cargo vehicle",
          "entityType": "facility",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "fire-III experiments were performed on the Orbital Science’s Cygnus resupply vehicle after it deberthed from the ISS. As a follow on to the Saffire 1 investigat",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/040q-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-exploration",
          "entityLabel": "Exploration vehicle / habitat",
          "entityType": "mission-environment",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "xperiment provides a new way to study a realistic fire on an exploration vehicle, which has not been possible in the past because the risks are too high. Instru",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-flow",
          "entityLabel": "Flow controller / anemometer",
          "entityType": "sensor",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "e used to measure pressure, CO2 and O2 mole faction, and two anemometer tracked flow velocity. All data was compressed, and subsequently downlinked. Details rel",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-cotton",
          "entityLabel": "Cotton fabric",
          "entityType": "material",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "ire 1 investigation, the Saffire III investigation also used SIBAL as the sample material. However, the experiments were conducted at a flow velocity of 30 cm/s",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sup-co2",
          "entityLabel": "Carbon dioxide (suppressant)",
          "entityType": "suppressant",
          "source": "PSI-100_record.txt",
          "location": "document body",
          "context": "igh. Instruments on an unmanned cargo vessel measure oxygen, carbon dioxide, heat, pressure and flame growth, and two video cameras provide views of the flame.",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-100",
        "titleConfidence": "medium",
        "doi": "10.60555/040q-4h36",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f004-PSI-100_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f004.extract.json",
      "processingMs": 32
    },
    {
      "id": "f005",
      "name": "PSI-101_record.txt",
      "sizeBytes": 4774,
      "sha256": "0f1d5369b9c03409fc9d9a0132e5ecfb175fd9c6fc26fa80d7590bf42b453c62",
      "kind": "txt",
      "status": "extracted",
      "domain": "aerosol-smoke",
      "text": {
        "chars": 4767,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f005-PSI-101_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/2np7-jv14"
        ]
      },
      "entities": [
        {
          "entityId": "inv-same",
          "entityLabel": "SAME",
          "entityType": "investigation",
          "source": "PSI-101_record.txt",
          "location": "document body",
          "context": "NASA PSI INVESTIGATION RECORD — PSI-101 TITLE: Smoke Aerosol Measurement Experiment-Reflight SHORT LABEL: RESEARCH AREA: Combustion Science / Spa",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-samer",
          "entityLabel": "SAME-R",
          "entityType": "investigation",
          "source": "PSI-101_record.txt",
          "location": "document body",
          "context": "he original SAME investigation, the primary objective of the SAME-R investigation was to quantify the sizes that the liquid smoke particulate achieves in low gr",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-101_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/2np7-jv14 | SOURCE: KEYWORDS: S, o, o, t, , , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-101_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/2np7-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-smoke-detector",
          "entityLabel": "Smoke detector",
          "entityType": "sensor",
          "source": "PSI-101_record.txt",
          "location": "document body",
          "context": "ercial Diagnostic Enclosures that includes a DustTrak and an ionization detector used in SAME. SAME-R flight tests were conducted from July 16, to September 9,",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-101",
        "titleConfidence": "medium",
        "doi": "10.60555/2np7-jv14",
        "years": [
          2010
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f005-PSI-101_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f005.extract.json",
      "processingMs": 17
    },
    {
      "id": "f006",
      "name": "PSI-102_record.txt",
      "sizeBytes": 4231,
      "sha256": "612926b9247fc45ac65b7af840dcc253c887f1c611de2aff911db907d9706d36",
      "kind": "txt",
      "status": "extracted",
      "domain": "aerosol-smoke",
      "text": {
        "chars": 4227,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f006-PSI-102_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/gd4k-8h62"
        ]
      },
      "entities": [
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-102_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/gd4k-8h62 | SOURCE: KEYWORDS: S, m, o, k, e, , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-102_record.txt",
          "location": "document body",
          "context": "A: Combustion Science / Spacecraft Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/gd4k-",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-102",
        "titleConfidence": "medium",
        "doi": "10.60555/gd4k-8h62",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f006-PSI-102_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f006.extract.json",
      "processingMs": 28
    },
    {
      "id": "f007",
      "name": "PSI-106_record.txt",
      "sizeBytes": 2657,
      "sha256": "f6b6b35fbd6face9395dd5bcde343cc5fee3fa811a553cc7b88656e367d76e6f",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 2655,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f007-PSI-106_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/pm12-rg61"
        ]
      },
      "entities": [
        {
          "entityId": "inv-slice",
          "entityLabel": "SLICE",
          "entityType": "investigation",
          "source": "PSI-106_record.txt",
          "location": "document body",
          "context": "and thermal radiation in non-premixed flames. APPROACH: The SLICE apparatus consisted of a fan-driven flow duct, exchangeable burner tubes, and integrated sens",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-106_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/pm12-rg61 | SOURCE: KEYWORDS: f, u, e, l, , d, i,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-106_record.txt",
          "location": "document body",
          "context": "T LABEL: RESEARCH AREA: Combustion Science / PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/pm12-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-106_record.txt",
          "location": "document body",
          "context": "ed under controlled coflow air conditions. A high resolution camera captured still images while sensor data was overlaid on these images. Calibration tests for",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-106_record.txt",
          "location": "document body",
          "context": "rates and temperature. This setup used several fuels such as methane, ethylene, and nitrogen-diluted mixtures. Flames were then manually ignited and observed un",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-106",
        "titleConfidence": "medium",
        "doi": "10.60555/pm12-rg61",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f007-PSI-106_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f007.extract.json",
      "processingMs": 12
    },
    {
      "id": "f008",
      "name": "PSI-107_record.txt",
      "sizeBytes": 2926,
      "sha256": "68fcc667f543ddf557ea423a5a760aa33defba82298ad76b4f86009294229d92",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 2924,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f008-PSI-107_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/9kbh-e962"
        ]
      },
      "entities": [
        {
          "entityId": "inv-spice",
          "entityLabel": "SPICE",
          "entityType": "investigation",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "g, h, t, e, r, , f, l, a, m, e OBJECTIVES: The objective of SPICE is to better understand the complex process of combustion by observing flames in a microgravi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/9kbh-e962 | SOURCE: KEYWORDS: S, o, o, t, , , ,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-msg",
          "entityLabel": "Microgravity Science Glovebox (MSG)",
          "entityType": "facility",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "phenomena in space. APPROACH: The experimental setup in the microgravity science glovebox consisted of an apparatus with a flow duct with integrated nozzles, c",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "ESEARCH AREA: Combustion Science / Fire Safety PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/9kbh-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "the sooting propensity of different fuels, such as ethylene, propane, and propylene mixtures. (4) Validate the correlation between luminous flame shape and resi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-methane",
          "entityLabel": "Methane",
          "entityType": "fuel",
          "source": "PSI-107_record.txt",
          "location": "document body",
          "context": "s, cameras, and fuel delivery systems. Fuels tested included methane, ethylene, propane, propylene, and propylene mixtures. Each flame was ignited in a controll",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-107",
        "titleConfidence": "medium",
        "doi": "10.60555/9kbh-e962",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f008-PSI-107_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f008.extract.json",
      "processingMs": 22
    },
    {
      "id": "f009",
      "name": "PSI-108_record.txt",
      "sizeBytes": 8374,
      "sha256": "c84640d2e7d889a08240e1eae51a3b28e95ec2c61325b04c1771ce1b5f48c9b7",
      "kind": "txt",
      "status": "extracted",
      "domain": "fluid-physics",
      "text": {
        "chars": 8186,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f009-PSI-108_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [
          {
            "id": "prandtl-number",
            "name": "Prandtl number",
            "where": "page/slide 1"
          }
        ],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/j1z3-bw42"
        ]
      },
      "entities": [
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-108_record.txt",
          "location": "document body",
          "context": "en Convection) RESEARCH AREA: Fluid Physics / PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: Space Shuttle DOI: 10.60555/j1z3-bw42 | SOURCE: https",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-camera",
          "entityLabel": "Camera imaging",
          "entityType": "sensor",
          "source": "PSI-108_record.txt",
          "location": "document body",
          "context": "nt of non-intrusive measurement techniques, such as infrared imaging and particle image velocimetry, for the STDCE have expanded the toolkit for studying fluid",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-ir",
          "entityLabel": "Infrared imaging",
          "entityType": "sensor",
          "source": "PSI-108_record.txt",
          "location": "document body",
          "context": "refinement of non-intrusive measurement techniques, such as infrared imaging and particle image velocimetry, for the STDCE have expanded the toolkit for studyi",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "eq-prandtl-number",
          "entityLabel": "Prandtl number",
          "entityType": "equation",
          "source": "PSI-108_record.txt",
          "location": "document body",
          "context": "g thermocapillary flow, including the Marangoni number (Ma), Prandtl number (Pr), aspect ratio (Ar), and the novel surface deformation parameter (S). These para",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-108",
        "titleConfidence": "medium",
        "doi": "10.60555/j1z3-bw42",
        "years": [
          2026
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f009-PSI-108_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f009.extract.json",
      "processingMs": 23
    },
    {
      "id": "f010",
      "name": "PSI-115_record.txt",
      "sizeBytes": 3138,
      "sha256": "94e2fb92879242fa9b82766fa8f9406482376a15fbfa83f6ac151d1d3c3df484",
      "kind": "txt",
      "status": "extracted",
      "domain": "aerosol-smoke",
      "text": {
        "chars": 3136,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-004/f010-PSI-115_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/q0v5-1v28"
        ]
      },
      "entities": [
        {
          "entityId": "inv-same",
          "entityLabel": "SAME",
          "entityType": "investigation",
          "source": "PSI-115_record.txt",
          "location": "document body",
          "context": "PSI INVESTIGATION RECORD — PSI-115 TITLE: Utilization of the Smoke Aerosol Measurement Experiment Data for Advanced Modeling and Simulation of Smoke Generation",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-115_record.txt",
          "location": "document body",
          "context": "ention of this effort is to quantify the differences between microgravity and Earth gravity smoke, and to identify the fluid dynamic mechanisms that cause the d",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-115",
        "titleConfidence": "medium",
        "doi": "10.60555/q0v5-1v28",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-004/f010-PSI-115_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-004/f010.extract.json",
      "processingMs": 18
    }
  ],
  "totals": {
    "files": 10,
    "extracted": 10,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 10,
    "pages": 0,
    "chars": 43719,
    "tables": 0,
    "tableRows": 0,
    "equations": 1,
    "figures": 0,
    "entities": 59,
    "newEntities": 1,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 11,
    "files": 73,
    "uniqueFiles": 72,
    "duplicateFiles": 1,
    "documents": 72,
    "pages": 432,
    "chars": 926637,
    "tables": 44,
    "tableRows": 2223,
    "equations": 157,
    "figures": 468,
    "mediaAssets": 216,
    "entities": 116,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261113-004",
    "updatedAt": "2026-11-13T15:15:45.997Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('data/ingest/batches/B-20261113-005.json', '{
  "batchId": "B-20261113-005",
  "receivedAt": "2026-11-13T15:15:47.032Z",
  "fileCount": 5,
  "files": [
    {
      "id": "f001",
      "name": "PSI-117_record.txt",
      "sizeBytes": 3581,
      "sha256": "81f76211d55748d7fffd49622f3c4ac842d710a2e94dedaf834f6583605cce62",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3573,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-005/f001-PSI-117_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/gz0q-b577"
        ]
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-117_record.txt",
          "location": "document body",
          "context": "ned from PSI through NASA’s Flame Extinguishment Experiment (FLEX) to quantify how externally imposed thermal and convective perturbations regulated the dynamic",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-117_record.txt",
          "location": "document body",
          "context": "he dynamics and ultimate fate of already established droplet cool flames, and to explain run-to-run variability by isolating the roles of deliberate heating and",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-117_record.txt",
          "location": "document body",
          "context": "nsfer, and radiation. Model fidelity was established against ISS FLEX measurements, after which controlled simulations examined three forcing modes (i) convecti",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-117_record.txt",
          "location": "document body",
          "context": "o hot ignition and warm-flame behavior, and extinction under microgravity. By leveraging and extending the FLEX data in the PSI, this study produced reusable mo",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-117",
        "titleConfidence": "medium",
        "doi": "10.60555/gz0q-b577",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-005/f001-PSI-117_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-005/f001.extract.json",
      "processingMs": 16
    },
    {
      "id": "f002",
      "name": "PSI-142_record.txt",
      "sizeBytes": 4772,
      "sha256": "f046d1d8b1458b183447b6af24802c670286dc402916e2c62af96c560293b0fa",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 4768,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-005/f002-PSI-142_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/80qf-vj95",
          "10.1016/j.pecs.2019.100787",
          "10.1016/j.proci.2020.09.019",
          "10.1016/j.combustflame.2017.01.028",
          "10.1016/j.combustflame.2016.01.008"
        ]
      },
      "entities": [
        {
          "entityId": "inv-flex",
          "entityLabel": "FLEX",
          "entityType": "investigation",
          "source": "PSI-142_record.txt",
          "location": "document body",
          "context": "G, r, a, n, t OBJECTIVES: By using the Flame Extinguishment (FLEX) experimental data from the Physical Sciences Informatics (PSI) system of combustion science,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-142_record.txt",
          "location": "document body",
          "context": "elop a new diagram of the flammability limits of diffusional cool flames affected by radiation, diffusion, and convection. 2) Bridge the knowledge gap betwe",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-142_record.txt",
          "location": "document body",
          "context": "and cool flames. 3) Verify the phenomena observed on the ISS flame extinguishment experiments. 4) Obtain new, quantitative data of extinction limit, fla",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-142_record.txt",
          "location": "document body",
          "context": "elevant to combustion in highly turbulent flow fields and in microgravity environments, owing to the possibility of long residence times. The results showed tha",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-heptane",
          "entityLabel": "n-Heptane",
          "entityType": "fuel",
          "source": "PSI-142_record.txt",
          "location": "document body",
          "context": "odeling schemes, (a) spark-assisted flame propagation of a n-heptane/air mixture, (b) one dimensional freely-propagating dimethyl ether (DME) flames using an ar",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-142",
        "titleConfidence": "medium",
        "doi": "10.60555/80qf-vj95",
        "years": [
          2016,
          2017,
          2019,
          2020
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-005/f002-PSI-142_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-005/f002.extract.json",
      "processingMs": 25
    },
    {
      "id": "f003",
      "name": "PSI-159_record.txt",
      "sizeBytes": 3490,
      "sha256": "e911b6ec6e91ca7ed516f35a876380a7237817b0ed64fda1a800078ab369c6b6",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3484,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-005/f003-PSI-159_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/cyt1-kh64"
        ]
      },
      "entities": [
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "e efficient internal combustion engines. HARDWARE: {\"Name\": \"ACME Combustion Integrated Rack (CIR)\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-cldflame",
          "entityLabel": "CLD-Flame",
          "entityType": "investigation",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "59 TITLE: Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases SHORT LABEL: RESEARCH AREA: Combustion Science / Flames of Ga",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-iss",
          "entityLabel": "International Space Station",
          "entityType": "facility",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "PROJECT TYPE: Microgravity Investigation | FLIGHT PLATFORM: International Space Station (ISS) DOI: 10.60555/cyt1-kh64 | SOURCE: KEYWORDS: c, h, e, m, i, c, a,",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fac-cir",
          "entityLabel": "Combustion Integrated Rack (CIR)",
          "entityType": "facility",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "cient internal combustion engines. HARDWARE: {\"Name\": \"ACME Combustion Integrated Rack (CIR)\", \"Link\": \"https://www1.grc.nasa.gov/space/iss-research/iss-fcf/co",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "NVESTIGATION RECORD — PSI-159 TITLE: Advanced Combustion via Microgravity Experiments / Cool Flames Investigation with Gases SHORT LABEL: RESEARCH AREA: Combus",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "sen-pmt",
          "entityLabel": "Photomultiplier tube",
          "entityType": "sensor",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "serve the flames with a broad suite of cameras, radiometers, photomultiplier tubes, and thermocouples. HYPOTHESIS: The hypotheses of this research are that test",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "fuel-propane",
          "entityLabel": "Propane",
          "entityType": "fuel",
          "source": "PSI-159_record.txt",
          "location": "document body",
          "context": "ine the conditions for which cool diffusion flames occur for propane, n-butane, and n-pentane; normal and inverse flames; and a broad range of Zst, Tad, and flu",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-159",
        "titleConfidence": "medium",
        "doi": "10.60555/cyt1-kh64",
        "years": [
          2012
        ],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-005/f003-PSI-159_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-005/f003.extract.json",
      "processingMs": 13
    },
    {
      "id": "f004",
      "name": "PSI-60_record.txt",
      "sizeBytes": 3095,
      "sha256": "09ddff51a83747129024e84980b4f74a867f6cbeeaab39bd8fda6309f6b289d7",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 3089,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-005/f004-PSI-60_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/mzjm-yv57"
        ]
      },
      "entities": [
        {
          "entityId": "inv-spice",
          "entityLabel": "SPICE",
          "entityType": "investigation",
          "source": "PSI-60_record.txt",
          "location": "document body",
          "context": "D — PSI-60 TITLE: Computational and Experimental Analysis of SPICE Data Sets SHORT LABEL: RESEARCH AREA: Combustion Science / Gaseous PROJECT TYPE: Ground Inve",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-acme-bre",
          "entityLabel": "ACME / BRE",
          "entityType": "investigation",
          "source": "PSI-60_record.txt",
          "location": "document body",
          "context": "gate formation. Simulations were performed for both Yale and ACME burner configurations under normal and microgravity conditions. Comparisons between experiment",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-60_record.txt",
          "location": "document body",
          "context": "heavily sooting flames. The work further aimed to reconcile microgravity and normal gravity flame behavior, identify key physical and chemical processes influe",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-60",
        "titleConfidence": "medium",
        "doi": "10.60555/mzjm-yv57",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-005/f004-PSI-60_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-005/f004.extract.json",
      "processingMs": 30
    },
    {
      "id": "f005",
      "name": "PSI-62_record.txt",
      "sizeBytes": 4397,
      "sha256": "65dcc7322daac517aae5135a465132881064fbe5efc77d9d47a7bd79edc20a24",
      "kind": "txt",
      "status": "extracted",
      "domain": "combustion",
      "text": {
        "chars": 4383,
        "headings": [],
        "fullTextPath": "data/extracted/batches/B-20261113-005/f005-PSI-62_record.txt"
      },
      "tables": [],
      "equations": {
        "matchedKnown": [],
        "heuristicFormulas": [],
        "doiLike": [
          "10.60555/e9xp-ex83"
        ]
      },
      "entities": [
        {
          "entityId": "inv-bass",
          "entityLabel": "BASS",
          "entityType": "investigation",
          "source": "PSI-62_record.txt",
          "location": "document body",
          "context": "fuel combustion processes with high fidelity, using the NASA Burning and Suppression of Solids (BASS and BASS-II) experiments as benchmarks. Ultimately, the lon",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-bass2",
          "entityLabel": "BASS-II",
          "entityType": "investigation",
          "source": "PSI-62_record.txt",
          "location": "document body",
          "context": ", using the NASA Burning and Suppression of Solids (BASS and BASS-II) experiments as benchmarks. Ultimately, the long-term goal was to enable accurate predictio",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "inv-fgm",
          "entityLabel": "FGM",
          "entityType": "investigation",
          "source": "PSI-62_record.txt",
          "location": "document body",
          "context": "was to develop and validate new flamelet generated manifold (FGM) modeling techniques for concurrent flame spread in microgravity. Concurrent flame spread prese",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "env-microgravity",
          "entityLabel": "Microgravity environment",
          "entityType": "mission-environment",
          "source": "PSI-62_record.txt",
          "location": "document body",
          "context": "Flame Spread Modeling using Flamelet Generated Manifolds in Microgravity with Comparison to BASS Experiments using Two-Color Tomography SHORT LABEL: RESEARCH",
          "evidence": "dictionary-match"
        },
        {
          "entityId": "mat-pmma",
          "entityLabel": "PMMA",
          "entityType": "material",
          "source": "PSI-62_record.txt",
          "location": "document body",
          "context": "lat sheets, spheres, and rod-shaped polymethyl methacrylate (PMMA) samples, as well as wax cylinders. Experimental imagery found in PSI from the BASS and BASS-I",
          "evidence": "dictionary-match"
        }
      ],
      "publication": {
        "title": "NASA PSI INVESTIGATION RECORD — PSI-62",
        "titleConfidence": "medium",
        "doi": "10.60555/e9xp-ex83",
        "years": [],
        "authorConfidence": "low",
        "note": "title taken from the first substantial line of the text layer (medium confidence); no clear author pattern — authors not recorded rather than guessed; no numbered references section detected"
      },
      "media": [],
      "errors": [],
      "unresolved": [],
      "rawPath": "data/raw/batches/B-20261113-005/f005-PSI-62_record.txt",
      "extractedPath": "data/extracted/batches/B-20261113-005/f005.extract.json",
      "processingMs": 12
    }
  ],
  "totals": {
    "files": 5,
    "extracted": 5,
    "duplicates": 0,
    "unsupported": 0,
    "failed": 0,
    "documents": 5,
    "pages": 0,
    "chars": 19297,
    "tables": 0,
    "tableRows": 0,
    "equations": 0,
    "figures": 0,
    "entities": 24,
    "newEntities": 0,
    "mediaAssets": 0
  },
  "cumulative": {
    "batches": 12,
    "files": 78,
    "uniqueFiles": 77,
    "duplicateFiles": 1,
    "documents": 77,
    "pages": 432,
    "chars": 945934,
    "tables": 44,
    "tableRows": 2223,
    "equations": 157,
    "figures": 468,
    "mediaAssets": 216,
    "entities": 116,
    "errors": 0,
    "userConfirmedAllUploads": true,
    "lastBatchId": "B-20261113-005",
    "updatedAt": "2026-11-13T15:15:47.313Z"
  },
  "unresolvedIssues": [],
  "modelImpact": "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded."
}', '2026-11-14T00:00:00Z');
INSERT INTO kv_json (path, value, updated_at) VALUES ('_seed/meta', '{"seeded":"2026-11-14","note":"immutable corpus baseline; large artifacts resolve via /corpus assets"}', '2026-11-14T00:00:00Z');
