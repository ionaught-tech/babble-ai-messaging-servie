

const sendWhatsAppMessage = async (
    message: string,
    phoneId: string,
    to: string,
    token = process.env.WHATSAPP_TOKEN,
    mediaUrl?: string,
    mediaType?: string,
    filename?: string
) => {
    try {
        const addressMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'interactive',
            interactive: {
                type: 'address_message',
                body: {
                    text: message
                },
                action: {
                    name: "address_message",
                    parameters:{
                        country: "IN",
                    }
                }
            }
        };
        const contactMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'contacts',
            contacts: [{
                name: {
                    formatted_name: 'Babble AI',
                    first_name: 'Babble',
                    last_name: 'AI'
                },
                phones: [{
                    phone: '+917907030865',
                    wa_id: '917907030865'
                }]
            }]
        };

        const interactiveCallToAction = {
            messaging_product: "whatsapp",
            to: to,
            recipient_type: 'individual',
            type: 'interactive',
            interactive: {
                type: 'cta_url',
                header: {
                    type: 'text',
                    text: 'Babble AI'
                },
                body: {
                    text: message
                },
                action: {
                    name: 'cta_url',
                    parameters: {
                        display_text: 'Link to Babble AI',
                        url: 'https://www.babble.ai'
                    }
                }
            }
        };

        const locationMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'location',
            location: {
                latitude: 12.9715987,
                longitude: 77.594566,
                name: 'Babble AI',
                address: 'Bangalore, India'
            }
        };

        const stickerMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'sticker',
            sticker: {
                // id: "1013859600285441",
                link: 'https://assets.babble-ai.com/Assets/Images/qiYqmJeN9-1ArEkJ.webp'
            }
        };

        const interactiveButtonMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: message
                },
                footer: {
                    text: 'Footer Text'
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'unique-reply-id',
                                title: 'Visit Babble AI'
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'unique-reply-id-2',
                                title: 'Open Babble AI'
                            }
                        }
                    ]
                }
            }
        };

        const locationRequestBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'interactive',
            interactive: {
                type: 'location_request_message',
                body: {
                    text: message
                },
                action: {
                    name: 'send_location',
                }
            }
        };

        const interactiveListMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: 'Choose an option'
                },
                body: {
                    text: message
                },
                action: {
                    button: 'View Options',
                    sections: [
                        {
                            title: 'Section 1',
                            rows: [
                                {
                                    id: 'option1',
                                    title: 'Option 1'
                                },
                                {
                                    id: 'option2',
                                    title: 'Option 2'
                                }
                            ]
                        },
                        {
                            title: 'Section 2',
                            rows: [
                                {
                                    id: 'option3',
                                    title: 'Option 3'
                                }
                            ]
                        }
                    ]
                }
            }
        };

        const interactiveFlowMessageBody = {
            messaging_product: "whatsapp",
            to: to,
            type: 'interactive',
            interactive: {
                type: 'flow',
                body: { text: "Click fill form" },
                action: {
                    name: 'flow',
                    parameters: {
                        flow_message_version: "3",
                        flow_id: '722368960430909',
                        flow_cta: "Sign Up",
                    }
                }
            }
        };

        const response = await fetch(
            `https://graph.facebook.com/v16.0/${phoneId}/messages?access_token=${token}`,
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(interactiveFlowMessageBody || {
                messaging_product: "whatsapp",
                to: to,
                text: !mediaUrl ? { body: message } : undefined,
                type: mediaType || undefined,
                [mediaType || 'image']: mediaUrl ? { 
                    link: mediaUrl,
                    caption: mediaType !== 'audio' ? message : undefined,
                    filename: mediaType && ['document'].includes(mediaType) ? filename : undefined,
                } : undefined
            })
            });
        const data = await response.json();
        console.log('data', data);
        
        if (data.error) {
            console.log('error', 'Failed to send WhatsApp message', data);
            return;
        }
    } catch (e) {
        console.log(e);
    }
};

const getMediaUrl = async (mediaId: string, token: string) => {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v16.0/${mediaId}?access_token=${token}`,
            {
            method: "GET",
            headers: { "Content-Type": "application/json" }
            }
        );
        const urlRequest = await response.json();
        if (!urlRequest?.url) return null;
        return urlRequest.url;
    } catch (e) {
        return null;
    }
};

const getMedia = async (url: string, token: string) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return response;
    } catch (e) {
        return null;
    }
};

export {
    sendWhatsAppMessage,
    getMediaUrl,
    getMedia
};
