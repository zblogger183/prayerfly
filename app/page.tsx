export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="font-sans text-2xl font-semibold tracking-tight text-foreground">
        PrayerFly
      </span>
      <p className="font-sans text-base text-foreground/70">
        أدعية موثقة بإسناد صحيح
      </p>
      <p className="font-naskh max-w-md text-2xl leading-loose text-foreground">
        بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ
      </p>
    </div>
  );
}
