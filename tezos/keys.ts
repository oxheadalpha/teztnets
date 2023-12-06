import * as pulumi from "@pulumi/pulumi"
import { InMemorySigner } from '@taquito/signer';

async function getPublicKeyFromPrivateKey(privateKeyOutput: pulumi.Output<string>): Promise<pulumi.Output<string>> {
  const publicKeyOutput = privateKeyOutput.apply(async privateKey => {
    try {
      const signer = await InMemorySigner.fromSecretKey(privateKey);
      const publicKey = await signer.publicKey();
      return publicKey;
    } catch (error) {
      console.error('Error in generating public key:', error);
      throw error;
    }
  });

  // Mark the output as a non-secret
  return pulumi.unsecret(publicKeyOutput);
}
export default getPublicKeyFromPrivateKey;
