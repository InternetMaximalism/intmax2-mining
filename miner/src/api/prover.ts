import axios from "axios";

export interface WithdrawInput {
  isMain: boolean;
  depositIndex: number;
  recipient: string;
  salt: string;
  pubkey: string;
}

export interface ProofResponse {
  proof: string;
  publicInputs: WithdrawPublicInputs;
}

export interface WithdrawPublicInputs {
  depositRoot: string;
  nullifier: string;
  tokenIndex: number;
  amount: string;
}

export async function requestProve(
  data: WithdrawInput
): Promise<ProofResponse> {
  try {
    const response = await axios.post<ProofResponse>(
      "http://127.0.0.1:8090/api/prove-withdraw",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error message: ", error.message);
      throw new Error("An error occurred while sending the POST request");
    } else {
      console.error("Unexpected error: ", error);
      throw new Error("An unexpected error occurred");
    }
  }
}
