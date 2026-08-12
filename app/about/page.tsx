import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

const canonicalPath = "/عن-الموقع";

export const metadata: Metadata = {
  title: "عن الموقع",
  description: "كيف يعمل PrayerFly: منهج التوثيق والتحقق من الأدعية والأذكار المنشورة.",
  alternates: { canonical: canonicalPath },
};

export default function AboutPage() {
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/" },
    { label: "عن الموقع", href: canonicalPath },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mb-6 mt-3 font-sans text-3xl font-bold text-foreground">عن الموقع</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/85">
        <p>
          PrayerFly موقع يجمع الأدعية والأذكار الثابتة عن النبي ﷺ، مع بيان درجة صحة كل نص
          ومصدره، لمن يريد أن يدعو بما ثبت لا بما اشتهر فقط. هذه الصفحة تشرح كيف يُبنى كل نص
          منشور هنا، بالتفصيل لا بعبارات عامة.
        </p>

        <section>
          <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
            كيف نتحقق من كل نص
          </h2>
          <p>
            كل حديث أو أثر يُنشر هنا يُراجَع مباشرة عبر{" "}
            <a
              href="https://dorar.net"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary hover:underline"
            >
              الموسوعة الحديثية بموقع الدرر السنية
            </a>
            ، وليس عبر ملخصات بحث مجمَّعة أو ذاكرة عامة. لكل نص نستخرج بيانات التخريج الكاملة:
            الراوي، والمحدِّث الذي حكم عليه، والمصدر (صحيح البخاري، صحيح مسلم، سنن أبي داود...
            إلخ) مع رقم الحديث، وخلاصة حكم المحدث (صحيح، حسن، ضعيف). هذه البيانات هي ما يظهر في
            قسم "درجة الصحة" أسفل كل دعاء، وليست نصًا مكتوبًا اجتهادًا.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
            عندما تختلف الروايات
          </h2>
          <p>
            كثير من الأدعية المشهورة على الألسنة لها أكثر من رواية أو صيغة ثابتة. في هذه الحالة
            لا نختار رواية واحدة بصمت ونتجاهل الباقي؛ فمثلًا دعاء النوم يثبت بلفظ «باسمك أموت
            وأحيا» عن حذيفة في صحيح البخاري، وبزيادة «اللهم» في أوله في رواية أخرى من الحديث نفسه
            — فنعرض الصيغتين معًا مع مصدر كل واحدة، بدل تقديم إحداهما على أنها الوحيدة الثابتة.
            وعند دعاء الاستفتاح، حين وجدنا أن الصيغة الأكثر بحثًا («سبحانك اللهم وبحمدك») كانت
            في مسودتنا الأولى مسندة إلى طريق أضعف، أعدنا تخريجها من طريق أبي سعيد الخدري في سنن
            النسائي (صحيح) بدل الإبقاء على الطريق الأضعف لمجرد شهرته.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
            عندما لا يثبت نص محدد
          </h2>
          <p>
            بعض المناسبات المشهورة — كدعاء ختم القرآن أو دعاء يوم الجمعة — لا يرد فيها عن النبي
            ﷺ نص دعاء واحد محدد، وإنما تشتهر نصوص طويلة منسوبة إليه بلا سند صحيح، أو يكون
            المشروع فيها الدعاء بما شاء المسلم لا بلفظ ثابت (كساعة الإجابة يوم الجمعة). في هذه
            الحالات لا نختلق نصًا يبدو حديثًا ولا نقدّمه على أنه كذلك؛ نصرّح بذلك صراحة، ونعرض
            بدلاً منه ما ثبت فعلاً من عمل السلف أو أدعية جامعة صحيحة من مواضع أخرى، مع توضيح
            الفرق بوضعية "دعاء مأثور، وليس حديثًا نبويًا ثابتًا" الظاهرة على الصفحة نفسها.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
            ما لا نفعله
          </h2>
          <p>
            لا نستنتج تخريجًا لم نتحقق منه مباشرة. إن تعذّر الوصول إلى صفحة تخريج مباشرة على
            الدرر السنية لحديث ما، نكتفي بما تحقق فعلاً (كتصحيح عالم معيّن في كتاب معيّن) بدل
            افتراض مصدر لم نتأكد منه. وإن وُجد خلاف حقيقي بين المحدّثين حول تصحيح رواية، نذكر
            ذلك بدل تقديم درجة صحة واحدة موهمة بالإجماع.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
            إن وجدت خطأ
          </h2>
          <p>
            رغم هذا المنهج، الخطأ البشري وارد. في أسفل كل صفحة دعاء أو أذكار رابط "أبلغ عن خطأ"
            يفتح رسالة بريد مباشرة إلينا مع تحديد الصفحة تلقائيًا؛ نراجع كل بلاغ ونصحّح ما يثبت
            خطؤه.
          </p>
        </section>
      </div>
    </div>
  );
}
