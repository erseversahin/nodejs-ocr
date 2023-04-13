require("dotenv").config();

const Tesseract = require("tesseract.js");
const fs = require("fs");
const mime = require("mime-types");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.CHAT_GRT_API_KEY,
});
const openai = new OpenAIApi(configuration);

const filePath = "resim2.png";

const mimeType = mime.lookup(filePath);

if (mimeType && mimeType.startsWith("image/")) {
  fs.readFile(filePath, async function (err, data) {
    if (err) throw err;
    const result = await Tesseract.recognize(data, "tur");
    if (result === undefined) {
      console.log("OCR işlemi başarısız oldu");
    } else {
      console.log(result?.data.text);

      console.log("ChatGPT analiz ediyor.....");
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
            Sen sözleşmeleri analiz eden bir yapay zekasın.
            Bana bu sözleşme içerisinde geçen sözleşme başlığı, sözleşmenün türü, sözleşmenin konusu, taraflar, başlangıç tarihi, bitiş tarihi, adresleri bul ve bu sözleşme için 5 tane etiket oluştur bunuda etiketler olarak belirle tüm verileri JSON formatında gönder.
            Eğer sonuç bulamazsan JSON formatında result: false gönder.
            `,
          },
          {
            role: "user",
            content: result?.data.text,
          },
        ],
      });

      try {
        const jsonObject = JSON.parse(
          completion?.data?.choices[0]?.message?.content
        );
        console.log(jsonObject);
      } catch (err) {
        console.error(`${jsonString} bir JSON değil`);
      }
    }
  });
} else {
  console.log("Desteklenmeyen dosya türü");
}
