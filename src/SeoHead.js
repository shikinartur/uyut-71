import { Helmet } from "react-helmet";

export default function SeoHead() {
  return (
    <Helmet>
      <title>Каркасный дом Уют-71 — цена, комплектации, строительство</title>
      <meta name="description" content="Строительство каркасных домов под ключ. Дом Уют-71 — фиксированная цена, комплектации, фото, отзывы." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://ваш-сайт.ru/" />
    </Helmet>
  );
}
