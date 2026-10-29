import type {
  MailProviderInterface,
  SendMailOptions,
} from "@/modules/auth/domain/interfaces/MailProviderInterface";

export class MailProvider implements MailProviderInterface {
  public async sendMail(options: SendMailOptions): Promise<boolean> {
    // In local development or production logging mode
    console.info(
      `[MailProvider] Dispatching email to: ${options.to} | Subject: ${options.subject}`,
    );
    return true;
  }
}
