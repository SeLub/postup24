const telegrambot = require("node-telegram-bot-api");
require("dotenv").config();
const Sentry = require("@sentry/node");

module.exports = {
      name: 'telegram',
      async started() {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            this.chatId = process.env.TELEGRAM_CHAT_ID;
            this.storagePath = process.env.STORAGE_ENDPOINT + '/' +process.env.STORAGE_BUCKET_NAME +'/images/'
            this.bot = new telegrambot(token, {polling:true});
            this.bot.close();
            //this.bot.logOut();
      },
      methods: {
            isArrayEmpty (arr) { return Array.isArray(arr) && arr.length === 0 ? true : false },
            getMediaContentType(fileName) {
                  const ext = '.' + fileName.toLowerCase().split('.').pop();
                  switch (ext) {
                        case '.jpg':
                        case '.jpeg':
                        case '.png':
                        case '.webp':
                              return 'photo';
                        case '.csv':
                        case '.txt':
                        case '.doc':
                        case '.pdf':
                        case '.xls':
                              return 'document';
                        case '.avi':
                        case '.mp4':
                        case '.mpeg':
                        case '.webm':
                              return 'video';
                        case '.mp3':
                              return 'audio';
                        default:
                              throw new Error('Unsupported file type');
                  }
            },
            composeMediaGroup(text, mediaArray) {
                  let mediaPhotosAndVideos = [];
                  let mediaDocuments = [];
                  let mediaAudios = [];

                  mediaArray.forEach(fileName => {
                        const type = this.getMediaContentType(fileName);
                        switch (type) {
                              case 'photo':
                                    mediaPhotosAndVideos.push(                        
                                          {
                                              type: 'photo',
                                              media: this.storagePath + fileName,
                                              parse_mode: 'HTML',
                                          });
                                    return;
                              case 'video':
                                    mediaPhotosAndVideos.push(                        
                                          {
                                              type: 'video',
                                              media: this.storagePath + fileName,
                                              parse_mode: 'HTML',
                                          });
                                    return;
                              case 'document':
                                    mediaDocuments.push(
                                          {
                                                type: 'document',
                                                media: this.storagePath + fileName,
                                                parse_mode: 'HTML',
                                            });
                                    return;
                              case 'audio':
                                    mediaAudios.push(
                                          {
                                                type: 'audio',
                                                media: this.storagePath + fileName,
                                                parse_mode: 'HTML',
                                            });
                                    return;
                              default:
                                    return;
                        }
                  });
                  let capthionAdded = false;
                        if (mediaPhotosAndVideos[0] !== undefined) {
                              mediaPhotosAndVideos[0]['caption'] = text;
                              capthionAdded = true;
                        }

                        if (mediaDocuments[0] !== undefined && !capthionAdded) {
                              mediaDocuments[0]['caption'] = text;
                              capthionAdded = true;
                        }

                        if (mediaAudios[0] !== undefined && !capthionAdded) {
                              mediaAudios[0]['caption'] = text;
                              capthionAdded = true;
                        }

                  return { mediaPhotosAndVideos, mediaDocuments, mediaAudios };
            }
      },
      actions:{
            getMe(){                  
                  return this.bot.getMe()
            },
            sendPost(ctx){
                  const { text, mediaArray } = ctx.params;
                  const sendJustText = this.isArrayEmpty(mediaArray);


                  const transaction = Sentry.startSpan({
                        op: "test",
                        name: "My First Test Transaction",
                      });
                      
                      setTimeout(() => {
                        try {
                              console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                          foo();
                        } catch (e) {
                          Sentry.captureException(e);
                        } finally {
                          transaction.finish();
                        }
                      }, 99);


                  try {
                        if (sendJustText){
                              this.bot.sendMessage(this.chatId, text, { parse_mode: 'HTML' })
                        } else {
                              const { mediaPhotosAndVideos, mediaDocuments, mediaAudios } = this.composeMediaGroup(text, mediaArray);
                              
                              if (!this.isArrayEmpty(mediaDocuments)) 
                                    this.bot.sendMediaGroup(this.chatId, mediaDocuments);
                              
                              if (!this.isArrayEmpty(mediaAudios))
                                    this.bot.sendMediaGroup(this.chatId, mediaAudios);
                              
                              if (!this.isArrayEmpty(mediaPhotosAndVideos))
                                    this.bot.sendMediaGroup(this.chatId, mediaPhotosAndVideos);
                        }
                  } catch(error) {
                        console.log('Error in sendPost:', error);
                  }
                  
            }
      },
}