interface ButtonAction { buttons: { type: 'reply'; reply: { id: string; title: string } }[]; }
interface ListAction { buttonText: string; sections: { title: string; rows: { id: string; title: string }[] }[]; }
interface CtaUrlAction { name: string; displayText: string; url: string; }
interface FlowAction { name: string; flowMessageVersion: string; flowId: string; flowCta: string; }
interface AddressAction { country: string; }
interface LocationRequestAction {}

type InteractiveOptions =
  | { subtype: 'button'; action: ButtonAction; headerText?: string; bodyText?: string; footerText?: string }
  | { subtype: 'list'; action: ListAction; headerText?: string; bodyText?: string; footerText?: string }
  | { subtype: 'cta_url'; action: CtaUrlAction; headerText?: string; bodyText?: string; footerText?: string }
  | { subtype: 'flow'; action: FlowAction; headerText?: string; bodyText?: string; footerText?: string }
  | { subtype: 'address_message'; action: AddressAction; bodyText?: string }
  | { subtype: 'location_request_message'; action: LocationRequestAction; bodyText?: string };

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'contacts' | 'location' | 'interactive';

/** Parameters for sending a WhatsApp message */
export interface SendWhatsAppParams {
  phoneId: string;
  to: string;
  token?: string;
  type?: MessageType;
  message?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  filename?: string;
  interactive?: InteractiveOptions;
  contacts?: unknown[];
  location?: { latitude: number; longitude: number; name?: string; address?: string };
}

/**
 * Sends a WhatsApp message via the Cloud API using the global `fetch` function.
 * 
 * Supports sending text, media (image, video, audio, document), sticker, contacts, location, 
 * and all interactive message types (button, list, cta_url, flow, address_message, location_request_message).
 * 
 * @param opts - The parameters for sending a WhatsApp message.
 * @param opts.phoneId - The WhatsApp Business phone number ID.
 * @param opts.to - The recipient's WhatsApp phone number (in international format).
 * @param opts.token - Optional. The WhatsApp API access token. Defaults to `process.env.WHATSAPP_TOKEN`.
 * @param opts.type - Optional. The type of message to send. Defaults to `'text'`.
 * @param opts.message - Optional. The message body (for text or as caption for media).
 * @param opts.mediaUrl - Optional. The URL of the media to send (for image, video, audio, document, or sticker).
 * @param opts.mediaType - Optional. The type of media ('image', 'video', 'audio', 'document').
 * @param opts.filename - Optional. The filename for document messages.
 * @param opts.interactive - Optional. Interactive message options (for 'interactive' type).
 * @param opts.contacts - Optional. Array of contacts (for 'contacts' type).
 * @param opts.location - Optional. Location object (for 'location' type).
 * 
 * @returns A promise that resolves to the WhatsApp API response as a record.
 * 
 * @throws {Error} If the WhatsApp API returns an error or if required parameters are missing.
 */
export async function sendWhatsAppMessage(opts: SendWhatsAppParams): Promise<Record<string, unknown>> {
  const {
    phoneId, to, token = process.env.WHATSAPP_TOKEN!, type = 'text',
    message = '', mediaUrl, mediaType, filename,
    interactive, contacts, location
  } = opts;

  const url = `https://graph.facebook.com/v16.0/${phoneId}/messages?access_token=${token}`;
  const base = { messaging_product: 'whatsapp', to };
  let body: Record<string, unknown>;

  switch (type) {
    case 'text':
      body = { ...base, type, text: { body: message } };
      break;
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      body = {
        ...base,
        type: mediaType!,
        [mediaType!]: {
          link: mediaUrl,
          ...(mediaType !== 'audio' ? { caption: message } : {}),
          ...(mediaType === 'document' && filename ? { filename } : {})
        }
      };
      break;
    case 'sticker':
      body = { ...base, type, sticker: { link: mediaUrl } };
      break;
    case 'contacts':
      body = { ...base, type, contacts: contacts! };
      break;
    case 'location':
      body = { ...base, type, location: location! };
      break;
    case 'interactive':
      if (!interactive) throw new Error('Interactive options required');
      body = { ...base, type, interactive: buildInteractive(interactive, message) };
      break;
    default:
      throw new Error(`Unsupported message type: ${type}`);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errJson = await res.json();
    throw new Error(`WhatsApp API error: ${(errJson as any).error?.message || res.statusText}`);
  }

  return res.json();
}

function buildInteractive(opts: InteractiveOptions, defaultText: string): Record<string, unknown> {
  const base: any = { type: opts.subtype, body: { text: opts.bodyText ?? defaultText } };
  if ('headerText' in opts && opts.headerText) base.header = { type: 'text', text: opts.headerText };
  if ('footerText' in opts && opts.footerText) base.footer = { text: opts.footerText };

  switch (opts.subtype) {
    case 'button': base.action = { buttons: opts.action.buttons }; break;
    case 'list': base.action = { button: opts.action.buttonText, sections: opts.action.sections }; break;
    case 'cta_url':
      base.action = { name: opts.action.name, parameters: { display_text: opts.action.displayText, url: opts.action.url } };
      break;
    case 'flow':
      base.action = { name: opts.action.name, parameters: {
        flow_message_version: opts.action.flowMessageVersion,
        flow_id: opts.action.flowId,
        flow_cta: opts.action.flowCta
      }};
      break;
    case 'address_message':
      base.action = { name: 'address_message', parameters: { country: opts.action.country } };
      break;
    case 'location_request_message':
      base.action = { name: 'send_location' };
      break;
  }
  return base;
}