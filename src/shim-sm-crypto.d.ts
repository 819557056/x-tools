declare module 'sm-crypto' {
  export namespace sm2 {
    interface KeyPair {
      publicKey: string;
      privateKey: string;
    }

    function generateKeyPairHex(): KeyPair;
    function doEncrypt(msg: string, publicKey: string, cipherMode?: number): string;
    function doDecrypt(encryptData: string, privateKey: string, cipherMode?: number): string;
    function doSignature(msg: string, privateKey: string, options?: { hash?: boolean; der?: boolean; userId?: string }): string;
    function doVerifySignature(msg: string, signature: string, publicKey: string, options?: { hash?: boolean; der?: boolean; userId?: string }): boolean;
  }

  export const sm3: (str: string) => string;

  export namespace sm4 {
    interface Sm4Options {
      key: string;
      mode?: 'ecb' | 'cbc';
      iv?: string;
      padding?: 'pkcs#5' | 'pkcs#7' | 'none';
    }

    function encrypt(msg: string | number[], key: string | number[], options?: Sm4Options): string | number[];
    function decrypt(encryptData: string | number[], key: string | number[], options?: Sm4Options): string | number[];
  }
}

