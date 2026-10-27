export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailProviderInterface {
  sendMail(options: SendMailOptions): Promise<boolean>;
}
