declare module "@bringinxyz/lnurl-pay" {
  export interface LnurlPayOptions {
    lnUrlOrAddress: string;
    tokens: number;
    comment?: string;
    posMode?: boolean; // NEW parameter for POS mode
    onionAllowed?: boolean;
    fetchGet?: (url: string) => Promise<any>;
    timeout?: number; // Request timeout in milliseconds
  }

  export interface PayServiceParams {
    callback: string;
    fixed: boolean;
    min: number;
    max: number;
    domain: string;
    metadata: any[];
    metadataHash: string;
    identifier: string;
    description: string;
    image: string;
    commentAllowed: number;
    rawData?: any;
  }

  export interface InvoiceResponse {
    invoice: string;
    params: PayServiceParams;
    successAction?: any;
    rawData: any;
    hasValidAmount: boolean;
    hasValidDescriptionHash: boolean;
    validatePreimage: () => boolean;
  }

  export interface InvoiceWithServiceParamsResponse {
    invoice: string;
    successAction?: any;
    rawData: any;
  }

  export interface ServiceParamsOptions {
    lnUrlOrAddress: string;
    posMode?: boolean;
    onionAllowed?: boolean;
    fetchGet?: (url: string) => Promise<any>;
    timeout?: number;
  }

  export interface InvoiceWithServiceParamsOptions {
    params: PayServiceParams;
    tokens: number;
    comment?: string;
    timeout?: number;
  }

  /**
   * Enhanced LNURL Pay with POS mode support
   * Drop-in replacement for lnurl-pay library that adds Bringin POS functionality
   */
  export declare class EnhancedLnurlPay {
    /**
     * Request invoice with POS mode support - same API as lnurl-pay
     * @param options - Request options
     * @returns Promise<InvoiceResponse> Invoice response in lnurl-pay format
     * @throws Error When validation fails or request errors occur
     */
    static requestInvoice(options: LnurlPayOptions): Promise<InvoiceResponse>;

    /**
     * Request pay service params with POS support
     * @param options - Request options
     * @returns Promise<PayServiceParams> Service parameters in lnurl-pay format
     * @throws Error When validation fails or request errors occur
     */
    static requestPayServiceParams(
      options: ServiceParamsOptions
    ): Promise<PayServiceParams>;

    /**
     * Request invoice with service params (2nd step) - with POS support
     * @param options - Request options
     * @returns Promise<InvoiceWithServiceParamsResponse> Invoice response
     * @throws Error When validation fails or request errors occur
     */
    static requestInvoiceWithServiceParams(
      options: InvoiceWithServiceParamsOptions
    ): Promise<InvoiceWithServiceParamsResponse>;

    /**
     * Parse description from metadata
     * @param metadata - Metadata array
     * @returns string Description text
     */
    static parseDescription(metadata: any[]): string;

    /**
     * Extract image from metadata
     * @param metadata - Metadata array
     * @returns string Image data or empty string
     */
    static extractImage(metadata: any[]): string;

    /**
     * Calculate metadata hash
     * @param metadata - Metadata to hash
     * @returns string Hash string
     */
    static calculateMetadataHash(metadata: string | any[]): string;
  }

  // Export individual functions to match lnurl-pay API
  export declare function requestInvoice(
    options: LnurlPayOptions
  ): Promise<InvoiceResponse>;
  export declare function requestPayServiceParams(
    options: ServiceParamsOptions
  ): Promise<PayServiceParams>;
  export declare function requestInvoiceWithServiceParams(
    options: InvoiceWithServiceParamsOptions
  ): Promise<InvoiceWithServiceParamsResponse>;

  // Default export
  export default EnhancedLnurlPay;
}
