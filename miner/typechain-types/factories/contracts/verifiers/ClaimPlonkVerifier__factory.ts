/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  ClaimPlonkVerifier,
  ClaimPlonkVerifierInterface,
} from "../../../contracts/verifiers/ClaimPlonkVerifier";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
      {
        internalType: "uint256[]",
        name: "public_inputs",
        type: "uint256[]",
      },
    ],
    name: "Verify",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50612b7d806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80637e4f7a8a14610030575b600080fd5b61004a60048036038101906100459190612a90565b610060565b6040516100579190612b2c565b60405180910390f35b6000604051610220810161007384610447565b61007d858561045b565b610086866104b5565b61008f876104d2565b600061009c86868a6106aa565b90506100a7816109f2565b90506100b38189610a5a565b90506100bf8189610af1565b60608301517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010361011885630100000085612950565b08806101a086015261012b84888a610b5f565b61013685898d610ec6565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182820891508161018088015261016b611282565b6101748c612480565b61017d8c612408565b6101868c612002565b61018f8c611ada565b6101988c6117e9565b6101a18c6113d7565b6101e087015197506129bc565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f77726f6e67206e756d626572206f66207075626c696320696e707574730000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f6572726f72206563206f7065726174696f6e00000000000000000000000000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f696e707574732061726520626967676572207468616e207200000000000000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601060248201527f77726f6e672070726f6f662073697a65000000000000000000000000000000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f6f70656e696e677320626967676572207468616e2072000000000000000000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600c60248201527f6572726f722076657269667900000000000000000000000000000000000000006044820152606481fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601460248201527f6572726f722072616e646f6d2067656e206b7a670000000000000000000000006044820152606481fd5b60088114610458576104576101ae565b5b50565b600160005b828110156104a1577f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000184351082169150602084019350600181019050610460565b50806104b0576104af61026c565b5b505050565b6060600102610340018082146104ce576104cd6102cb565b5b5050565b60016102a082017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181351082169150610280830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181351082169150610180830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001813510821691506101a0830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001813510821691506101c0830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001813510821691506101e0830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181351082169150610200830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181351082169150610260830190507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001813510821691506103408301905060005b6001811015610696577f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182351083169250602082019150600181019050610654565b50816106a5576106a461032a565b5b505050565b600060405161022081016467616d6d6181527f132893973f9bfd040c1d2f14deae8ab39939f028a89695e9a51041ecbc353eba60208201527f1bc55692c4d18fbf2cda86445b20721e7639da9cb9e743ae9738fa742cf01a5460408201527f1aae9492c047d8ba13342cedf59276c6df50bd433921e0212673b477ba1144e060608201527f0d86485d30326191f6cf93a9da7755da1ee2c518882cdfd98268d04777d66d9f60808201527f19d72d73ca3652f6c7ba6d10de727f053a9a483c1f2f75164519ac2731217e5260a08201527f0c582a704c4306fc732d919c09b8f235718d38357ffa3137af64c471f171e4b960c08201527f2cd0b91e8a0bfbbc14751a310bea8105720aec4ca576b46cef13c2b3edb105b560e08201527f155d1fbf6c77427e3d9e41150b863845ec598d6d43e1273f11f8ca81041745f66101008201527f2b47457fe7db52639e541a94f564cb0a91d0b92aead363b038b0153161c23db86101208201527f1040eaba17035821fae38b07287869ece9b3d5d4f5c4beb8b65e09eba821c0656101408201527f0450e30bb17b9dad2cd9449c20a901efbe7abe9384d2371ea0425d61d2ed1c276101608201527f2c71e1f57406c5a4f3c8b66e6ff051415c94e6c6a24e8d165bba1e23b09eaf846101808201527f2f8abb8103086dac581d44bf84c242e64d75c4c3f7b19d0174effd7f649f6e296101a08201527f04fff8ce958dd588d2e09d8c1723f39a53b4fd238736de326b0536b798123b966101c08201527f25a36ca2b61427af832efb758f0f419962b0fabaf166fc0bbaa8e33d6180197b6101e08201527f1c849b8d0dca91feae4ea1a223632b50827672fbb00b46582ed3ad2325715f6f6102008201527f21b38243a746b5410254d7ef482fc485c36a87f70e3e1c5d8534d6f5f2c0530d6102208201527f06da8c14025797fa87be7a45792f507c5f53af8f44e26699f4ea51eb755f0b1161024082015261026081016020860280888337808201915060c0808784378083019250816102c50160406001028101905060208582601b880160025afa806109b8576109b7610389565b5b855197507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000188066040880152505050505050509392505050565b600060405161022060405101636265746181528360208201526020816024601c840160025afa80610a2657610a25610389565b5b815193507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000184066020840152505050919050565b600060405161022060405101606564616c70686182526020820186815260208101905061036086016001604002808284378083019250808401935060406102208901843760208585601b880160025afa80610ab857610ab7610389565b5b855197507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001880660008801525050505050505092915050565b60405161022060405101637a657461815283602082015260c0808401604083013760208160e4601c840160025afa80610b2d57610b2c610389565b5b81517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181066060850152505050505050565b600060405160608101516101a082015186610b7c81888486610bfa565b6000805b88811015610bed577f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001883584510991507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018288089650602083019250602088019750600181019050610b80565b5050505050509392505050565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f30644e427ce32d4886b01bfe313ba1dba6db8b2045d128178a7164500e0a6c11830960018560005b86811015610ceb577f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001837f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000103860882527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f0c9fabc7845d50d2852e2a0371c6441f145e0db82e8326961c25f1e3e32b045b84099250602082019150600181019050610c44565b50610cf7818789610db4565b8690506001915060005b86811015610daa577f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001837f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001868551090982526020820191507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f0c9fabc7845d50d2852e2a0371c6441f145e0db82e8326961c25f1e3e32b045b84099250600181019050610d01565b5050505050505050565b600183526000805b83811015610e0a5781850151828401517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001818309905060208401935080848801525050600181019050610dbc565b5060208103820191508084019350610e4a6020850160027f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001038651612950565b60005b84811015610ebe5760208603955083517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001875184098086527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182850993506020860395505050600181019050610e4d565b505050505050565b600060405160608101516101a08201516103608501600080610eee8a6020850135853561107f565b9150610f018a6290bf998b018688610f3f565b90507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000180828409880896506040830192505050505050509392505050565b6000610f6c85857f0c9fabc7845d50d2852e2a0371c6441f145e0db82e8326961c25f1e3e32b045b612950565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001817f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000103840894507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f30644e427ce32d4886b01bfe313ba1dba6db8b2045d128178a7164500e0a6c11820990506110288660027f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010387612950565b94507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000185820990507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001848209915050949350505050565b6000808452600060208501528160408501528260608501526000608085015360306081850153600060828501536042608385015360536084850153604260858501536032608685015360326087850153602d608885015360506089850153606c608a850153606f608b850153606e608c850153606b608d850153600b608e850153602084608f8660025afa8061111857611117610389565b5b8451600160208701536042602187015360536022870153604260238701536032602487015360326025870153602d602687015360506027870153606c6028870153606f6029870153606e602a870153606b602b870153600b602c870153602086602d8860025afa91508161118f5761118e610389565b5b808651186020870152600260408701536042604187015360536042870153604260438701536032604487015360326045870153602d604687015360506047870153606c6048870153606f6049870153606e604a870153606b604b870153600b604c87015360208601602081602d8360025afa92508261121157611210610389565b5b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017001000000000000000000000000000000008851099350602087015160801c7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018186089450505050509392505050565b604051610220604051016101a08201517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010360608501510861130b8360027f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010383612950565b90507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f30644e427ce32d4886b01bfe313ba1dba6db8b2045d128178a7164500e0a6c11820990507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001828209915060008401517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181840992507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181840992508260808601525050505050565b6040516102208101610140820151815261016082015160208201526102c083013560408201526102e08301356060820152610220830135608082015261024083013560a082015261030083013560c082015261032083013560e082015260608201516101008201526101c08201516101208201526020816101408360025afa80611464576114636103e8565b5b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018251069050816040810192506102c085013581526102e085013560208201526114b483836103008801846128a8565b61014084016114c984846102208901846128a8565b61012085016114dd846102608901836128fe565b846040810195507f1fa4be93b5e7f7e674d5059b63554fab99638b304ed8310e9fa44c281ac9b03b81527f1a01ae7fac6228e39d3cb5a5e71fd31160f3241e79a5f48ffb3737e6c389b72160208201528151604082015260408160608360075afa8061154c5761154b610389565b5b6020820180517f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703815261158288848788612760565b8760408901985061159d8960608c01516102c08e018461281b565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000017f0c9fabc7845d50d2852e2a0371c6441f145e0db82e8326961c25f1e3e32b045b60608c0151097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001818a09985061161b8a8a6103008f01856128a8565b6116278a83898a612760565b6020880180517f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703815287518b52602088015160208c01527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c260408c01527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed60608c01527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b60808c01527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa60a08c0152885160c08c0152602089015160e08c01527f22f1acbb03c4508760c2430af35865e7cdf9f3eb1224504fdcc3708ddb954a486101008c01527f2a344fad01c2ed0ed73142ae1752429eaea515c6f3f6b941103cc21c2308e1cb6101208c01527f159f15b842ba9c8449aa3268f981010d4c7142e5193473d80b464e964845c3f86101408c01527f0efd30ac7b6f8d0d3ccbc2207587c2acbad1532dc0293f0d034cf8258cd428b36101608c01526117ad8b6117bc565b50505050505050505050505050565b604051602060006101808460085afa6000516101e083015180838316169150816101e08501525050505050565b6040516102206040510160208101604082016101c084015180610140860160a087015161014088015260c0870151610160880152610280880135610120880152611838868360e08a0184612852565b61184b826102a08a016101208a016128fe565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018383099150611884868360008b016101408b016128a8565b611897826101808a016101208a016128fe565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000183830991506118cc868360408b01846128a8565b6118df826101a08a016101208a016128fe565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018383099150611914868360808b01846128a8565b611927826101c08a016101208a016128fe565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000183830991507f132893973f9bfd040c1d2f14deae8ab39939f028a89695e9a51041ecbc353eba86527f1bc55692c4d18fbf2cda86445b20721e7639da9cb9e743ae9738fa742cf01a54855261199f84838884612852565b6119b2826101e08a016101208a016128fe565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000183830991507f1aae9492c047d8ba13342cedf59276c6df50bd433921e0212673b477ba1144e086527f0d86485d30326191f6cf93a9da7755da1ee2c518882cdfd98268d04777d66d9f8552611a2a84838884612852565b611a3d826102008a016101208a016128fe565b61034088017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000184840992507f21b38243a746b5410254d7ef482fc485c36a87f70e3e1c5d8534d6f5f2c0530d87527f06da8c14025797fa87be7a45792f507c5f53af8f44e26699f4ea51eb755f0b118652611aba85848985612852565b611ac983826101208b016128fe565b602081019050505050505050505050565b604051610220604051016467616d6d6181526060820151602082015260a0820151604082015260c0820151606082015260e0820151608082015261010082015160a082015260c06000840160c08301377f132893973f9bfd040c1d2f14deae8ab39939f028a89695e9a51041ecbc353eba6101808201527f1bc55692c4d18fbf2cda86445b20721e7639da9cb9e743ae9738fa742cf01a546101a08201527f1aae9492c047d8ba13342cedf59276c6df50bd433921e0212673b477ba1144e06101c08201527f0d86485d30326191f6cf93a9da7755da1ee2c518882cdfd98268d04777d66d9f6101e08201526102007f21b38243a746b5410254d7ef482fc485c36a87f70e3e1c5d8534d6f5f2c0530d818301527f06da8c14025797fa87be7a45792f507c5f53af8f44e26699f4ea51eb755f0b1160208201830152604081019050610280840135818301526102a084013560208201830152610180840135604082018301526101a0840135606082018301526101c0840135608082018301526101e084013560a0820183015261020084013560c0820183015260e081018201610340850160005b6001811015611ca65781358352602082019150602083019250600181019050611c82565b506102608601358252601b600360010260170160208102600501905060206101c088018284890160025afa80611cdf57611cde610389565b5b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101c0890151066101c0890152505050505050505050565b604051610220604051017f2cd0b91e8a0bfbbc14751a310bea8105720aec4ca576b46cef13c2b3edb105b581527f155d1fbf6c77427e3d9e41150b863845ec598d6d43e1273f11f8ca81041745f66020820152611d82604082016101808501358360e086016127e4565b7f2b47457fe7db52639e541a94f564cb0a91d0b92aead363b038b0153161c23db881527f1040eaba17035821fae38b07287869ece9b3d5d4f5c4beb8b65e09eba821c0656020820152611de2604082016101a08501358360e08601612852565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101a0840135610180850135097f0450e30bb17b9dad2cd9449c20a901efbe7abe9384d2371ea0425d61d2ed1c2782527f2c71e1f57406c5a4f3c8b66e6ff051415c94e6c6a24e8d165bba1e23b09eaf846020830152611e6b60408301828460e08701612852565b7f2f8abb8103086dac581d44bf84c242e64d75c4c3f7b19d0174effd7f649f6e2982527f04fff8ce958dd588d2e09d8c1723f39a53b4fd238736de326b0536b798123b966020830152611ecb604083016101c08601358460e08701612852565b7f25a36ca2b61427af832efb758f0f419962b0fabaf166fc0bbaa8e33d6180197b82527f1c849b8d0dca91feae4ea1a223632b50827672fbb00b46582ed3ad2325715f6f6020830152611f29604083018360e0860160e08701612760565b6103408401610360850160005b6001811015611f77578135855260208201356020860152611f606040860184358760e08a01612852565b602083019250604082019150600181019050611f36565b507f19d72d73ca3652f6c7ba6d10de727f053a9a483c1f2f75164519ac2731217e5284527f0c582a704c4306fc732d919c09b8f235718d38357ffa3137af64c471f171e4b96020850152611fd360408501888660e08901612852565b61022086013584526102408601356020850152611ff860408501898660e08901612852565b5050505050505050565b60405160208101516040820151606083015160008401517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000184610260880135097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101e088013586097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001610180890135820890507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000185820890507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000161020089013587097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101a08a0135820890507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000186820890507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018284097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182820990507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000185820990507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001600580097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001878a097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101808d0135820895507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000189870895507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016005820994507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101a08d0135860894507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000189860894507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000182820993507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101c08d0135850893507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000189850893507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018587097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000018582099050807f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010390507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000188820990507f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160808d0151820890506123f981858f611d18565b50505050505050505050505050565b60405160026301000000016102206040510161242981836060860151612950565b61243c8282610140880160a0880161281b565b61245282610100870160a0870160a088016127a2565b612464828260a0870160a088016127e4565b6124798260c0870160a0870160a088016127a2565b5050505050565b604051610220604051017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160208301516101e08501350981527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001604083015182510881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101808401358251088152602081017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160208401516102008601350981527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001604084015182510881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101a08501358251088152604082017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160408501516101c08701350881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001825184510983527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001815184510983527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001600085015184510983527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016102608601358451098352606083017f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101808601516102a08801350881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001845182510881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160808601517f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000010382510881527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016101a086015161028088013509835282518151146101e0860152505050505050565b6040518251855260208301516020860152835160408601526020840151606086015260408260808760065afa8061279a5761279961020d565b5b505050505050565b6040518251855260208301516020860152833560408601526020840135606086015260408260808760065afa806127dc576127db61020d565b5b505050505050565b604051825185526020830151602086015283604086015260408260608760075afa806128135761281261020d565b5b505050505050565b604051823585526020830135602086015283604086015260408260608760075afa8061284a5761284961020d565b5b505050505050565b604051825185526020830151602086015283604086015260408560608760075afa825160408701526020830151606087015260408360808860065afa81169050806128a05761289f61020d565b5b505050505050565b604051823585526020830135602086015283604086015260408560608760075afa825160408701526020830151606087015260408360808860065afa81169050806128f6576128f561020d565b5b505050505050565b7f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001838335097f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000181835108825250505050565b600060208452602080850152602060408501528160608501528260808501527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000160a085015260208460c08660055afa600081036129b0576129af610389565b5b84519150509392505050565b50505050505050949350505050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126129fa576129f96129d5565b5b8235905067ffffffffffffffff811115612a1757612a166129da565b5b602083019150836001820283011115612a3357612a326129df565b5b9250929050565b60008083601f840112612a5057612a4f6129d5565b5b8235905067ffffffffffffffff811115612a6d57612a6c6129da565b5b602083019150836020820283011115612a8957612a886129df565b5b9250929050565b60008060008060408587031215612aaa57612aa96129cb565b5b600085013567ffffffffffffffff811115612ac857612ac76129d0565b5b612ad4878288016129e4565b9450945050602085013567ffffffffffffffff811115612af757612af66129d0565b5b612b0387828801612a3a565b925092505092959194509250565b60008115159050919050565b612b2681612b11565b82525050565b6000602082019050612b416000830184612b1d565b9291505056fea2646970667358221220fe10a9557e8538809fedcd1bc1ed50b2671bf9477d9d3454771a085a42011b6864736f6c63430008180033";

type ClaimPlonkVerifierConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ClaimPlonkVerifierConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ClaimPlonkVerifier__factory extends ContractFactory {
  constructor(...args: ClaimPlonkVerifierConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ClaimPlonkVerifier & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ClaimPlonkVerifier__factory {
    return super.connect(runner) as ClaimPlonkVerifier__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ClaimPlonkVerifierInterface {
    return new Interface(_abi) as ClaimPlonkVerifierInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ClaimPlonkVerifier {
    return new Contract(address, _abi, runner) as unknown as ClaimPlonkVerifier;
  }
}