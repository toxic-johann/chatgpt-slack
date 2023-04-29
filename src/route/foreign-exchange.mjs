import CC from 'currency-converter-lt';
import { getThreadTs } from '../selectors/message.mjs';
import { chatCompletion } from '../utils/openai.mjs';

export const regExp = /^((fx:)|(\d+(\.\d+)?\s?(港元|澳门元|元|圆|越南盾|日圆|基普|瑞尔|菲律宾比索|马元|新加坡元|泰铢|缅元|斯里兰卡卢比|马尔代夫卢比|盾|巴基斯坦卢比|卢比|尼泊尔卢比|阿富汗尼|伊朗里亚尔|伊拉克第纳尔|叙利亚镑|黎巴嫩镑|约旦第纳尔|亚尔|科威特第纳尔|巴林第纳尔|卡塔尔里亚尔|阿曼里亚尔|也门里亚尔|也门第纳尔|土耳其镑|塞浦路斯镑|欧元|欧|冰岛克朗|丹麦克朗|挪威克朗|瑞典克朗|芬兰马克|卢布|兹罗提|捷克克朗|福林|马克|奥地利先令|瑞士法郎|荷兰盾|比利时法郎|卢森堡法郎|英镑|镑|爱尔兰镑|法郎|比塞塔|埃斯库多|里拉|马耳他镑|南斯拉夫新第纳尔|列伊|列弗|列克|德拉马克|加元|美元|墨西哥比索|格查尔|萨尔瓦多科朗|伦皮拉|科多巴|哥斯达黎加科朗|巴拿马巴波亚|古巴比索|巴哈马元|牙买加元|古德|多米尼加比索|特立尼达多巴哥元|巴巴多斯元|哥伦比亚比索|博利瓦|圭亚那元|苏里南盾|新索尔|苏克雷|新克鲁赛罗|玻利维亚比索|智利比索|阿根廷比索|巴拉圭瓜拉尼|乌拉圭新比索|埃及镑|利比亚第纳尔|苏丹镑|突尼斯第纳尔|阿尔及利亚第纳尔|摩洛哥迪拉姆|乌吉亚|非共体法郎|非共体法郎|非共体法郎|非共体法郎|非共体法郎|非共体法郎|法拉西|几内亚比索|利昂|利比里亚元|塞地|奈拉|中非金融合作法郎|中非金融合作法郎|中非金融合作法郎|中非金融合作法郎|中非金融合作法郎|赤道几内亚埃奎勒|兰特|吉布提法郎|索马里先令|肯尼亚先令|乌干达先令|坦桑尼亚先令|卢旺达法郎|布隆迪法郎|扎伊尔|赞比亚克瓦查|马达加斯加法郎|塞舌尔卢比|毛里求斯卢比|津巴布韦元|科摩罗法郎|大洋洲|澳大利亚元|新西兰元|斐济元|所罗门元)$))/i;

export const introduction = 'Calculate the equivalent RMB face value for any currency.';

export const route = async ({ message, say }) => {
  const thread_ts = getThreadTs(message);
  const currency = message.text.replace(/^fx:/i, '');
  const info = await chatCompletion(`
This is a currency string, ${currency}. Please extract the currency code and number and return them in the following format.
code: currency code;
number: xxx;
  `, {
    temperature: 0,
  });
  await say({ text: info, thread_ts });
  const code = info.match(/code:\s*([a-z]+)/i)[1];
  const number = info.match(/number:\s*(\d+(\.\d+)?)/i)[1];
  const currencyConverter = new CC({ from: code, to: 'CNY', amount: parseFloat(number) });
  const cny = await currencyConverter.convert();
  const rates = await currencyConverter.rates();
  console.log(rates);
  await say({ text: `${cny}元`, thread_ts });
};
