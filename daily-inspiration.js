(function() {
    'use strict';

    // Rotate through the teachings by calendar day so everyone sees the same quote.
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const DAILY_INSPIRATION_QUOTES = [
      {
        id: 1,        hebrew: "אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם. אֵיזֶהוּ גִבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ. אֵיזֶהוּ עָשִׁיר? הַשָּׂמֵחַ בְּחֶלְקוֹ. אֵיזֶהוּ מְכֻבָּד? הַמְכַבֵּד אֶת הַבְּרִיּוֹת",
        translation: "Who is wise? The one who learns from every person. Who is mighty? The one who subdues their own impulses. Who is rich? The one who rejoices in their portion. Who is honored? The one who honors others.",
        source: "Pirkei Avot 4:1",
        reflection: "Ben Zoma revolutionizes traditional definitions of success through four transformative questions. True wisdom isn't about accumulating knowledge, but maintaining openness to learn from everyone. Real strength (Gevurah) lies in conquering internal desires, not external foes. Wealth is found in gratitude (Hakarat Hatov) for what we have, not in endless accumulation. And honor comes from giving respect to all of God's creations (Briyot), thereby honoring the Creator. These teachings shift success from external achievements to internal character development."
      },
      {
        id: 2,        hebrew: "כִּ֤י שֶׁ֨בַע יִפּ֣וֹל צַדִּ֣יק וָקָ֑ם",
        translation: "For a righteous person falls seven times, and rises again.",
        source: "Proverbs 24:16",
        reflection: "Attributed to King Solomon, this proverb observes that righteousness is not about perfection, but about persistence. Failure is not the opposite of success; it is part of success. A Tzaddik (righteous person) isn't someone who never fails, but someone who refuses to stay down."
      },
      {
        id: 3,        hebrew: "חֲזַ֣ק וֶאֱמָ֔ץ אַֽל־תַּעֲרֹ֖ץ וְאַל־תֵּחָ֑ת",
        translation: "Be strong and courageous; do not be terrified or dismayed.",
        source: "Joshua 1:9",
        reflection: "Hashem spoke these words to Joshua after Moses died. This is the essence of 'Bitachon' (Trust in God). Courage doesn't mean you aren't afraid; it means you move forward despite your fear, trusting that Hashem is with you."
      },
      {
        id: 4,        hebrew: "אל תלבין פני חבירך ברבים. כי המלבין פני חבירו דם יחשב לו דם שפך. תדע דאזיל סומקא ואתי חיורא. ואין לו חלק לעולם הבא. ונוח לו לאדם שיפיל עצמו לתוך כבשן האש ואל ילבין פני חבירו ברבים.",
        translation: "Do not shame your fellow in public. For one who shames their fellow, it is considered as if they spilled blood. You can see this as the red [blood] leaves the face and paleness arrives. It is better for a person to throw themselves into a fiery furnace than to shame their fellow in public.",
        source: "Sefer HaYirah (232)",
        reflection: "This teaching from Rabbi Yonah of Gerona emphasizes the infinite dignity of every human being. Shaming someone is compared to murder because it causes a visible physical change—the blood draining from the face—and a devastating spiritual blow to the victim's soul. It serves as a stark reminder that our words carry the weight of life and death; preserving another's dignity is among the highest ethical callings."
      },
      {
        id: 5,        hebrew: "נֵ֣ר יְ֭הוָה נִשְׁמַ֣ת אָדָ֑ם",
        translation: "The soul of man is the candle of God.",
        source: "Proverbs 20:27",
        reflection: "King Solomon uses the metaphor of light. Just as a candle's purpose is to illuminate, your Neshama (soul) is a divine spark. Your purpose is to let that light shine, illuminating the darkness in your own unique way through Mitzvot and kindness."
      },
      {
        id: 6,        hebrew: "רַחֲמָנָא לִבָּא בָּעֵי",
        translation: "The Compassionate One desires the heart.",
        source: "Sanhedrin 106b / Zohar",
        reflection: "This concept from the Sages and Jewish Mysticism emphasizes that Hashem looks past external rituals to the internal intent (Kavanah). It's not just about your actions on the outside, but your intention on the inside; sincerity and passion matter more than robotic perfection."
      },
      {
        id: 7,        hebrew: "וְהַצְנֵ֥עַ לֶ֖כֶת עִם־אֱלֹהֶֽיךָ",
        translation: "Walk humbly with your God.",
        source: "Micah 6:8",
        reflection: "The Prophet Micah summed up the entire Torah into three requirements: Justice, Kindness, and Humility. True greatness is quiet; you don't need to broadcast your virtues, as living them with modesty (Tzniut) and integrity is enough."
      },
      {
        id: 8,        hebrew: "בְּצֶ֥לֶם אֱלֹהִ֖ים בָּרָ֣א אֹת֑וֹ",
        translation: "In the image of God He created him.",
        source: "Genesis 1:27",
        reflection: "This fundamental definition of humanity from the Creation narrative establishes our inherent worth. Never forget your infinite value; you are a reflection of the Divine (Tzelem Elokim), as is every person you meet."
      },

      // --- Part II: Kindness & Relationships ---
      {
        id: 9,        hebrew: "וְאָהַבְתָּ֥ לְרֵעֲךָ֖ כָּמ֑וֹךָ",
        translation: "Love your fellow (Israelites) as yourself.",
        source: "Leviticus 19:18",
        reflection: "Rabbi Akiva called this the 'Great Principle of the Torah.' It teaches that we are all connected souls, and treating others with love is the ultimate expression of our humanity."
      },
      {
        id: 10,        hebrew: "מָ֣וֶת וְ֭חַיִּים בְּיַד־לָשׁ֑וֹן",
        translation: "Death and life are in the power of the tongue.",
        source: "Proverbs 18:21",
        reflection: "The laws of Lashon Hara (evil speech) are based on this reality. Your words create worlds; you have the power to build someone up or tear them down in a single sentence. Choose to speak life."
      },
      {
        id: 11,        hebrew: "סוּר מֵרָע וַעֲשֵׂה טוֹב, בַּקֵּשׁ שָׁלוֹם וְרָדְפֵהוּ—בַּקְּשֵׁהוּ בִּמְקוֹמְךָ וְרָדְפֵהוּ בְּמָקוֹם אַחֵר",
        translation: "Turn from evil and do good; seek peace and pursue it—seek it in your own heart, and chase it into the hearts of others.",
        source: "Psalm 34:15 / Midrash Tehillim",
        reflection: "The Hebrew word for Peace, 'Shalom,' comes from the root 'Shalem,' which means 'Wholeness.' This reveals a clever truth: peace is not the absence of conflict, but the presence of completion. King David commands us to 'pursue' it because wholeness is elusive. The Sages teach that God found no vessel capable of holding all other blessings except Peace; if you lack peace, your other blessings leak away."
      },
      {
        id: 12,        hebrew: "יְהִי בֵיתְךָ פָתוּחַ לִרְוָחָה לְאַרְבַּע רוּחוֹת הָעוֹלָם, וְיִהְיוּ עֲנִיִּים בְּנֵי בֵיתֶךָ",
        translation: "Let your house be open wide to the four winds of the world, and let the vulnerable be the very children of your home.",
        source: "Pirkei Avot 1:5 / Avot D'Rabbi Natan",
        reflection: "In Hebrew, the word for 'wide' (Revacha) also implies 'relief' or 'breathing room.' When you open your doors, you aren't just giving a stranger a seat; you are giving your own soul room to breathe. A closed house is a prison of the self. By making your home a sanctuary for those who have nothing, you transform a physical building into a living extension of Abraham’s tent, where hospitality to man attracts the presence of the Divine."
      },
      {
        id: 13,        hebrew: "הֱוֵי דָן אֶת כָּל הָאָדָם לְכַף זְכוּת—אַל תָּדִין אֶת חֲבֵרְךָ עַד שֶׁתַּגִּיעַ לִמְקוֹמוֹ",
        translation: "Judge the 'whole' of every person by tipping the scale toward merit—never judging a person until you have stood in their very spot.",
        source: "Pirkei Avot 1:6 / 2:4",
        reflection: "The phrase 'Kol HaAdam' literally means 'The Whole of the person.' Most judge based on a single snapshot of a mistake, but the Sages tell us to look at the 'Whole'—the context and the hidden potential. There is a cosmic mirroring here: the way you judge below determines how the Heavenly Court judges you above. By cleverly finding a 'Zechut' (merit) in a person, you are building a spiritual defense for your own soul."
      },
      {
        id: 14,        hebrew: "וּקְנֵה לְךָ חָבֵר—אַל תִּקְרָא 'וּקְנֵה' אֶלָּא 'וּקְנֵה' כְּקָנֶה, שֶׁיְּהֵא לִבְּךָ רַךְ כַּקָּנֶה",
        translation: "Acquire for yourself a friend—read it not just as 'purchase' but as 'reed,' for your heart must be as flexible and soft as a reed to sustain a friendship.",
        source: "Pirkei Avot 1:6 / Kallah Rabbati",
        reflection: "The word 'Acquire' (K’neh) is a play on 'Kaneh' (a reed). A true friend is 'acquired' through a high price—the currency of vulnerability—but the bond must be like a reed: able to bend in the storm without breaking. The Talmud warns, 'Either friendship or death' (O Chavruta O Mituta), because a life without a mirror to challenge and love you is a life that has stopped growing."
      },
      {
        id: 15,        hebrew: "כַּ֭מַּיִם הַפָּנִ֣ים לַפָּנִ֑ים כֵּ֤ן לֵֽב־הָ֝אָדָ֗ם לָאָדָֽם",
        translation: "As water reflects the face, so one heart reflects another.",
        source: "Proverbs 27:19",
        reflection: "King Solomon observed this psychological mirroring in relationships. The energy you put out is the energy you get back—show love, and you will find it reflected in the hearts of others."
      },
      {
        id: 16,        hebrew: "הִנֵּ֣ה מַה־טּ֭וֹב וּמַה־נָּעִ֑ים שֶׁ֖בֶת אַחִ֣ים גַּם־יָֽחַד",
        translation: "Behold, how good and how pleasant it is for brothers to dwell together in unity.",
        source: "Psalm 133:1",
        reflection: "This Song of Ascents celebrates the rare moments when all tribes stood together. There is a unique spiritual power when people set aside their differences and live in harmony; unity is a vessel for blessing."
      },
      {
        id: 17,        hebrew: "שַׁלַּ֥ח לַחְמְךָ֖ עַל־פְּנֵ֣י הַמָּ֑יִם",
        translation: "Cast your bread upon the waters.",
        source: "Ecclesiastes 11:1",
        reflection: "King Solomon suggests taking risks in generosity (Tzedakah), even when the return isn't immediately visible. Do good without expecting an immediate reward; kindness has a ripple effect, and eventually, the good you put into the world will return to you."
      },
      {
        id: 18,        hebrew: "כָּל יִשְׂרָאֵל עֲרֵבִים זֶה בָּזֶה",
        translation: "All of Israel are responsible for one another.",
        source: "Talmud Shavuot 39a",
        reflection: "The Sages discussed communal liability using the word 'arevim' (guarantors). We are not isolated individuals; we are part of a greater whole. When one person falls, we all feel it, and when one rises, we all rise."
      },

      // --- Part III: Action & Purpose ---
      {
        id: 19,        hebrew: "אִם אֵין אֲנִי לִי, מִי לִי? וּכְשֶׁאֲנִי לְעַצְמִי, מָה אֲנִי? וְאִם לֹא עַכְשָׁיו, אֵימָתַי?",
        translation: "If I am not for myself, who will be for me? And if I am only for myself, what am I? And if not now, when?",
        source: "Pirkei Avot 1:14",
        reflection: "Hillel the Elder's famous trio of questions creates a perfect balance in ethical living. First, you must take personal responsibility for your own life and well-being—no one else can do your work for you. Second, self-care without care for others leads to an empty existence; a meaningful life is one lived in service to others. Finally, stop waiting for the 'perfect time'—the only moment you truly have to make a change is this one. These three questions encapsulate the tension between self and other, and between present action and future procrastination."
      },
      {
        id: 20,        hebrew: "לֹא עָלֶיךָ הַמְּלָאכָה לִגְמֹר, וְלֹא אַתָּה בֶן חוֹרִין לִבָּטֵל מִמֶּנָּה",
        translation: "It is not your duty to finish the work, but neither are you free to neglect it.",
        source: "Pirkei Avot 2:16",
        reflection: "Rabbi Tarfon lived through the destruction of the Temple and saw the massive task of rebuilding. He encourages us not to be paralyzed by the size of the world's problems; you don't have to fix everything (Tikkun Olam), but you must do your part."
      },
      {
        id: 21,        hebrew: "לְפוּם צַעֲרָא אַגְרָא",
        translation: "According to the effort is the reward.",
        source: "Pirkei Avot 5:23",
        reflection: "Ben Hei Hei emphasizes that the struggle itself gives value to the achievement. The harder the struggle, the greater the spiritual growth; the value of a Mitzvah is measured by the difficulty you overcame to perform it."
      },
      {
        id: 22,        hebrew: "וּבָחַרְתָּ֙ בַּחַיִּ֔ים",
        translation: "Therefore, choose life.",
        source: "Deuteronomy 30:19",
        reflection: "In his final address, Moses frames free will as a choice between life and death. Every day we are faced with choices that lead toward vitality and meaning or toward negativity; actively choose the path that brings life."
      },
      {
        id: 23,        hebrew: "אֱמֹר מְעַט וַעֲשֵׂה הַרְבֵּה",
        translation: "Say little and do much.",
        source: "Pirkei Avot 1:15",
        reflection: "Shammai, often seen as strict, emphasized integrity by teaching that over-promising leads to disappointment. Promises are cheap, but action is everything; let your character be defined by what you do, not just by what you say."
      },
      {
        id: 24,        hebrew: "כֹּ֠ל אֲשֶׁ֨ר תִּמְצָ֧א יָֽדְךָ֛ לַעֲשֹׂ֥ות בְּכֹחֲךָ֖ עֲשֵׂ֑ה",
        translation: "Whatever your hand finds to do, do it with all your might.",
        source: "Ecclesiastes 9:10",
        reflection: "Reflecting on the fleeting nature of life, King Solomon urges us to engage fully with the present task. Don't live life halfway; whatever task is in front of you, give it your full passion and energy."
      },
      {
        id: 25,        hebrew: "צֶ֥דֶק צֶ֖דֶק תִּרְדֹּ֑ף",
        translation: "Justice, justice shall you pursue.",
        source: "Deuteronomy 16:20",
        reflection: "The repetition of the word 'Justice' (Tzedek) teaches that the means used to get justice must also be just. We must not just wait for justice to happen; we must actively chase it with integrity."
      },
      {
        id: 26,        hebrew: "עֵ֥ת לִבְכּ֖וֹת וְעֵ֣ת לִשְׂח֑וֹק",
        translation: "A time to weep and a time to laugh.",
        source: "Ecclesiastes 3:4",
        reflection: "King Solomon acknowledges that the human experience requires a full range of emotions. Life is a cycle; it is healthy to embrace sadness when it comes, just as it is vital to embrace joy. Wisdom is knowing which season you are in."
      },

      // --- Part IV: Hope & Faith (Bitachon) ---
      {
        id: 27,        hebrew: "גַּם֩ כִּֽי־אֵלֵ֜ךְ בְּגֵ֣יא צַלְמָ֗וֶת לֹא־אִ֘ירָ֤א רָ֗ע כִּי־אַתָּ֥ה עִמָּדִ֑י",
        translation: "Though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.",
        source: "Psalm 23:4",
        reflection: "King David often wrote from caves while fleeing enemies, visualizing Hashem not as a distant observer, but as a companion in the dark. Even in your darkest moments, you are never truly alone."
      },
      {
        id: 28,        hebrew: "פּוֹתֵ֥חַ אֶת־יָדֶ֑ךָ וּמַשְׂבִּ֖יעַ לְכָל־חַ֣י רָצֽוֹן",
        translation: "You open Your hand and satisfy the desire of every living thing.",
        source: "Psalm 145:16",
        reflection: "This verse is central to the 'Ashrei' prayer. It is an affirmation that Hashem is the ultimate Provider. We put in our effort (Hishtadlut), but we trust that the outcome and our sustenance ultimately come from the Creator's open hand."
      },
      {
        id: 29,        hebrew: "וְקוֹיֵ֤ יְהוָה֙ יַחֲלִ֣יפוּ כֹ֔חַ",
        translation: "Those who hope in Hashem will renew their strength.",
        source: "Isaiah 40:31",
        reflection: "Isaiah compares those who trust in God to eagles who soar without growing weary. Hope (Tikvah) is a source of energy; when you are exhausted, connecting to the Eternal can recharge your spirit."
      },
      {
        id: 30,        hebrew: "קָר֣וֹב יְ֭הוָה לְנִשְׁבְּרֵי־לֵ֑ב",
        translation: "Hashem is close to the brokenhearted.",
        source: "Psalm 34:19",
        reflection: "King David realized that while humans often avoid broken people, God cherishes them. Heartbreak does not mean you are abandoned; on the contrary, vulnerability creates a unique opening for spiritual closeness."
      },
      {
        id: 31,        hebrew: "זֶה־הַ֭יּוֹם עָשָׂ֣ה יְהוָ֑ה נָגִ֖ילָה וְנִשְׁמְחָ֣ה בֽוֹ",
        translation: "This is the day Hashem has made; let us rejoice and be glad in it.",
        source: "Psalm 118:24",
        reflection: "This declaration from the Hallel prayer is made despite difficulties, thanking God for the gift of the present moment. Happiness is a choice we make in the present; don't wait for a special occasion, but find the joy in this specific day."
      },
      {
        id: 32,        hebrew: "הִנֵּ֣ה לֹֽא־יָ֭נוּם וְלֹ֣א יִישָׁ֑ן שׁ֝וֹמֵ֗ר יִשְׂרָאֵֽל",
        translation: "Behold, the Guardian of Israel neither slumbers nor sleeps.",
        source: "Psalm 121:4",
        reflection: "Travelers reciting this Psalm knew that while they must sleep, the Guardian does not. There is a constant, watchful force of protection over us; you can rest, knowing that the Almighty is watching over the Jewish people."
      },
      {
        id: 33,        hebrew: "אֲנִי לְדוֹדִי וְדוֹדִי לִי",
        translation: "I am my beloved's and my beloved is mine.",
        source: "Song of Songs 6:3",
        reflection: "King Solomon's Song of Songs is interpreted by the Sages as a metaphor for the love between Hashem and the Jewish people. This verse encapsulates the mutual, deep, and personal relationship every Jew has with the Creator."
      },
      {
        id: 34,        hebrew: "קוּמִי אוֹרִי כִּי בָא אוֹרֵךְ",
        translation: "Arise, shine, for your light has come.",
        source: "Isaiah 60:1",
        reflection: "Isaiah addressed a Jerusalem in ruins, prophesying a time when it would be a beacon of light. Wake up to your potential; the light you have been waiting for is already within you, you just need to stand up and reflect it."
      },
      {
        id: 35,        hebrew: "הַזֹּרְעִ֥ים בְּדִמְעָה בְּרִנָּ֥ה יִקְצֹֽרוּ",
        translation: "Those who sow in tears will reap in joy.",
        source: "Psalm 126:5",
        reflection: "This Psalm, sung before Birkat Hamazon, acknowledges that building is painful (tears) but promises a harvest of happiness. Pain is often the seed of future growth; the struggles you endure today are planting the fields for tomorrow's happiness."
      },
      {
        id: 36,        hebrew: "בְּטַ֣ח אֶל־יְ֭הוָה בְּכָל־לִבֶּ֑ךָ",
        translation: "Trust in Hashem with all your heart.",
        source: "Proverbs 3:5",
        reflection: "King Solomon advises against relying solely on human intellect. Sometimes you have to let go of your need to control everything and simply trust (Bitachon) that you are being guided in the right direction."
      },

      // --- Part V: Wisdom & Learning ---
      {
        id: 37,        hebrew: "רֵאשִׁית חָכְמָה יִרְאַת יְהוָה",
        translation: "The beginning of wisdom is awe of Hashem.",
        source: "Psalm 111:10",
        reflection: "The word 'Yirah' means both fear and awe. Wisdom isn't just data; it starts with the humility of realizing there is something vast and mysterious beyond us. True intelligence starts with the realization that the Creator is infinite."
      },
      {
        id: 38,        hebrew: "אוֹ חַבְרוּתָא אוֹ מִיתוּתָא",
        translation: "Either friendship or death.",
        source: "Taanit 23a",
        reflection: "The Talmud tells the story of Choni HaMa'agel to illustrate that loneliness is a form of death. We are social beings who need connection to survive; learning and living are best done with a partner (chavruta) who challenges and supports us."
      },
      {
        id: 39,        hebrew: "סְיָג לַחָכְמָה שְׁתִיקָה",
        translation: "A fence for wisdom is silence.",
        source: "Pirkei Avot 3:13",
        reflection: "Rabbi Akiva taught that just as a fence protects a garden, silence protects wisdom. Sometimes the smartest thing you can say is nothing at all; silence allows you to listen, observe, and learn before you speak."
      },
      {
        id: 40,        hebrew: "דִּבְרֵ֣י חֲכָמִ֔ים בְּנַ֖חַת נִשְׁמָעִ֑ים",
        translation: "The words of the wise are heard when spoken softly.",
        source: "Ecclesiastes 9:17",
        reflection: "King Solomon observed that shouting indicates insecurity, while quiet confidence commands attention. You don't need to shout to be heard; truth has its own quiet power that penetrates the heart more effectively than noise."
      },
      {
        id: 41,        hebrew: "לֹא הַבַּיְשָׁן לָמֵד, וְלֹא הַקַּפְּדָן מְלַמֵּד",
        translation: "The bashful cannot learn, and the impatient cannot teach.",
        source: "Pirkei Avot 2:5",
        reflection: "Hillel the Elder was known for his extreme patience. Growth requires vulnerability (to ask questions without shame) and patience (to explain answers without anger); both student and teacher must be open."
      },
      {
        id: 42,        hebrew: "בַּרְזֶ֣ל בְּבַרְזֶ֣ל יָ֑חַד וְ֝אִ֗ישׁ יַ֣חַד פְּנֵֽי־רֵעֵֽהוּ",
        translation: "As iron sharpens iron, so one person sharpens another.",
        source: "Proverbs 27:17",
        reflection: "King Solomon noted that a knife cannot sharpen itself; it needs friction against another stone. We improve through healthy debate (Machloket); surround yourself with people who challenge you to be sharper and better."
      },
      {
        id: 43,        hebrew: "חוֹתָמוֹ שֶׁל הַקָּדוֹשׁ בָּרוּךְ הוּא אֱמֶת",
        translation: "The seal of the Holy One, Blessed be He, is Truth.",
        source: "Shabbat 55a",
        reflection: "Rabbi Chanina taught that just as a seal authenticates a document, Truth (Emet) is the signature of God on reality. Living authentically and truthfully is the ultimate way to align yourself with the Divine."
      },
      {
        id: 44,        hebrew: "טֽוֹבָה־חָכְמָ֥ה מִפְּנִינִ֑ים",
        translation: "Wisdom is better than pearls.",
        source: "Proverbs 8:11",
        reflection: "Though King Solomon possessed vast wealth, he consistently wrote that wisdom was the only asset with intrinsic, eternal value. Material possessions are temporary, but the Torah wisdom you acquire becomes part of your soul forever."
      },
      {
        id: 45,        hebrew: "אַל תִּסְתַּכֵּל בְּקַנְקַן, אֶלָּא בְמַה שֶּׁיֵּשׁ בּוֹ",
        translation: "Do not look at the flask, but at what is inside.",
        source: "Pirkei Avot 4:20",
        reflection: "Rabbi Meir explained that a new flask can hold old, valuable wine, and an old flask can be empty. Don't judge people or situations by their external appearance; true value is found in the content of the character, not the packaging."
      },
      {
        id: 46,        hebrew: "הֲשִׁיבֵ֨נוּ יְהוָ֤ה ׀ אֵלֶ֙יךָ֙ וְֽנָשׁ֔וּבָה",
        translation: "Turn us back to You, O Lord, and we shall return.",
        source: "Lamentations 5:21",
        reflection: "This is the penultimate verse of Lamentations, recited to end on a note of hope. It is never too late to fix a relationship or start over; the door to return (Teshuvah) is always open."
      },

      // --- Part VI: World & Society ---
      {
        id: 47,        hebrew: "כָּל הַמְקַיֵּם נֶפֶשׁ אַחַת, כְּאִלּוּ קִיֵּם עוֹלָם מָלֵא",
        translation: "Whoever saves one life, it is as if he saved an entire world.",
        source: "Mishnah Sanhedrin 4:5",
        reflection: "The Mishnah teaches the infinite value of every individual. Never underestimate the impact of helping a single person; to that person, and to their future generations, your act is everything."
      },
      {
        id: 48,        hebrew: "וְכִתְּת֨וּ חַרְבוֹתָ֜ם לְאִתִּ֗ים",
        translation: "They shall beat their swords into plowshares.",
        source: "Isaiah 2:4",
        reflection: "The Prophet Isaiah's messianic vision envisions a time when nations will no longer study war. The ultimate Jewish vision is a world where energy spent on conflict is transformed into energy for creation and growth."
      },
      {
        id: 49,        hebrew: "עַל שְׁלֹשָׁה דְבָרִים הָעוֹלָם עוֹמֵד: עַל הַתּוֹרָה וְעַל הַעֲבוֹדָה וְעַל גְּמִילוּת חֲסָדִים",
        translation: "The world stands on three things: On Torah, on Service, and on Acts of Lovingkindness.",
        source: "Pirkei Avot 1:2",
        reflection: "Shimon HaTzaddik defined the spiritual ecosystem of the universe. A stable world requires a balance of wisdom (Torah), spirituality (Avodah/Prayer), and action (Gemilut Chasadim)."
      },
      {
        id: 50,        hebrew: "וְיִגַּ֥ל כַּמַּ֖יִם מִשְׁפָּ֑ט",
        translation: "Let justice roll down like waters.",
        source: "Amos 5:24",
        reflection: "The Prophet Amos railed against the corruption of the wealthy elite. Justice shouldn't be a trickle; it should be a powerful, unstoppable force that cleanses and refreshes society."
      },
      {
        id: 51,        hebrew: "וְאָהַבְתֶּ֖ם אֶת־הַגֵּ֑ר כִּי־גֵרִ֥ים הֱיִיתֶ֖ם",
        translation: "You shall love the stranger, for you were strangers.",
        source: "Deuteronomy 10:19",
        reflection: "The command to love the stranger appears 36 times in the Torah. Use your own history of suffering to build empathy for others; because we know what it feels like to be outsiders in Egypt, we must ensure no one else feels that way."
      },
      {
        id: 52,        hebrew: "לֹא בְחַיִל וְלֹא בְכֹחַ כִּי אִם בְּרוּחִי",
        translation: "Not by might, nor by power, but by My Spirit.",
        source: "Zechariah 4:6",
        reflection: "Prophet Zechariah spoke these words regarding the Menorah, indicating that the Temple would be built not by armies, but by divine spirit. True victories are won not by physical domination, but by spiritual integrity."
      },
      {
        id: 53,        hebrew: "עֹז־וְהָדָ֥ר לְבוּשָׁ֑הּ וַ֝תִּשְׂחַ֗ק לְי֣וֹם אַחֲרֽוֹן",
        translation: "Strength and dignity are her clothing, and she laughs at the future.",
        source: "Proverbs 31:25",
        reflection: "Describing the Woman of Valor (Eshet Chayil), this is also a lesson for the soul. When you clothe yourself in integrity and strength, you can face the unknown future with joy (Simcha) rather than fear."
      },
      {
        id: 54,        hebrew: "לַכֹּ֖ל זְמָ֑ן וְעֵ֥ת לְכׇל־חֵ֖פֶץ",
        translation: "To everything there is a season, and a time to every purpose.",
        source: "Ecclesiastes 3:1",
        reflection: "King Solomon meditates on the temporary nature of all situations. Patience is key; trust the timing of your life, knowing that what is happening now is just one season in a larger journey."
      },
      {
        id: 55,        hebrew: "עַל הַדִּין וְעַל הָאֱמֶת וְעַל הַשָּׁלוֹם",
        translation: "...on Justice, on Truth, and on Peace.",
        source: "Pirkei Avot 1:18",
        reflection: "Rabban Shimon ben Gamliel taught that society survives through Justice (Din), Truth (Emet), and Peace (Shalom). These are the three ingredients necessary for civilization; without truth, there is no justice, and without justice, there is no peace."
      },
      {
        id: 56,        hebrew: "שְׁמַ֖ע יִשְׂרָאֵ֑ל יְהוָ֥ה אֱלֹהֵ֖ינוּ יְהוָ֥ה ׀ אֶחָֽד",
        translation: "Hear O Israel, Hashem is our God, Hashem is One.",
        source: "Deuteronomy 6:4",
        reflection: "The central declaration of Jewish faith. It is the ultimate affirmation: beneath the surface fragmentation of the world, there is a fundamental Unity connecting us all to the One Creator."
      },

      // --- Part VII: Expanded Jewish Inspiration ---
      {
        id: 57,        hebrew: "אָכֵן יֵשׁ יְהוָה בַּמָּקוֹם הַזֶּה וְאָנֹכִי לֹא יָדָעְתִּי",
        translation: "Surely Hashem is in this place, and I did not know it.",
        source: "Genesis 28:16",
        reflection: "Jacob wakes from his dream and realizes God's presence is not limited to holy sites. Often, the Divine is right in front of us in our daily lives, but we are too distracted to notice the Kedusha (holiness) in the mundane."
      },
      {
        id: 58,        hebrew: "יְהוָה יִלָּחֵם לָכֶם וְאַתֶּם תַּחֲרִשׁוּן",
        translation: "Hashem will fight for you, and you shall remain silent.",
        source: "Exodus 14:14",
        reflection: "Spoken by Moses at the Yam Suf (Red Sea) when the people were panicking. Sometimes the right action is not to panic or strategize, but to stand still and let faith carry you through the crisis."
      },
      {
        id: 59,        hebrew: "מִצְוָה גְּדוֹלָה לִהְיוֹת בְּשִׂמְחָה תָּמִיד",
        translation: "It is a great Mitzvah to be happy always.",
        source: "Rebbe Nachman of Breslov",
        reflection: "Rebbe Nachman taught that joy is not just a feeling, but a religious obligation and a spiritual tool. Happiness opens the mind and heart, allowing us to connect to God and overcome challenges."
      },
      {
        id: 60,        hebrew: "לֹא עַל־הַלֶּחֶם לְבַדּוֹ יִחְיֶה הָאָדָם",
        translation: "Man does not live by bread alone.",
        source: "Deuteronomy 8:3",
        reflection: "Physical sustenance is necessary for survival, but it is not enough for a life of meaning. The Jewish soul requires purpose, Torah wisdom, and spiritual connection to truly be 'alive'."
      },
      {
        id: 61,        hebrew: "כִּי הָאָדָם יִרְאֶה לַעֵינַיִם וַיהוָה יִרְאֶה לַלֵּב",
        translation: "For man looks at the outward appearance, but Hashem looks at the heart.",
        source: "1 Samuel 16:7",
        reflection: "When Prophet Samuel went to anoint a new king, he was impressed by physical stature. God corrected him, teaching that external looks are deceiving; true leadership and worth come from internal character and Yirat Shamayim (Fear of Heaven)."
      },
      {
        id: 62,        hebrew: "קוֹל דְּמָמָה דַקָּה",
        translation: "A still small voice.",
        source: "1 Kings 19:12",
        reflection: "Elijah the Prophet sought God in the wind, earthquake, and fire, but God was in none of them. The Divine presence is often found not in the loud and spectacular, but in silence and subtlety."
      },
      {
        id: 63,        hebrew: "כִּי־תַעֲבֹר בַּמַּיִם אִתְּךָ־אָנִי",
        translation: "When you pass through the waters, I will be with you.",
        source: "Isaiah 43:2",
        reflection: "Life will inevitably involve passing through 'waters'—overwhelming emotions or situations. The promise isn't that you won't get wet, but that you won't drown because you are supported by the Rock of Israel."
      },
      {
        id: 64,        hebrew: "כִּי־הֶהָרִים יָמוּשׁוּ... וְחַסְדִּי מֵאִתֵּךְ לֹא־יָמוּשׁ",
        translation: "For the mountains may move... but My kindness shall not move from you.",
        source: "Isaiah 54:10",
        reflection: "Nature itself may change, but God's covenant of love is more permanent than the physical world. This offers profound stability in an ever-changing world."
      },
      {
        id: 65,        hebrew: "גַּם זוּ לְטוֹבָה",
        translation: "This too is for the good.",
        source: "Nachum Ish Gamzu (Talmud Taanit 21a)",
        reflection: "The sage Nachum would react to every misfortune with this phrase. It is the ultimate expression of faith that everything Hashem does—even if it appears painful in the moment—is ultimately for our benefit."
      },
      {
        id: 66,        hebrew: "כִּי חֶסֶד חָפַצְתִּי וְלֹא־זָבַח",
        translation: "For I desire kindness, and not sacrifice.",
        source: "Hosea 6:6",
        reflection: "Religious ritual without ethical behavior is empty. The Prophet Hosea teaches that Hashem prefers a heart full of Chessed (kindness) towards others over technical observance of rituals performed without love."
      },
      {
        id: 67,        hebrew: "אַל־תִּשְׂמְחִי אֹיַבְתִּי לִי כִּי נָפַלְתִּי קָמְתִּי",
        translation: "Do not rejoice over me, my enemy; though I have fallen, I will rise.",
        source: "Micah 7:8",
        reflection: "Resilience is the Jewish answer to adversity. By framing a fall as merely a prelude to rising (Yeridah l'tzorech Aliyah), you take away the power of any enemy or obstacle to defeat you."
      },
      {
        id: 68,        hebrew: "אֱמֶת וּמִשְׁפַּט שָׁלוֹם שִׁפְטוּ בְּשַׁעֲרֵיכֶם",
        translation: "Execute the judgment of truth and peace in your gates.",
        source: "Zechariah 8:16",
        reflection: "Truth and peace are often seen as opposites, but the prophet urges us to find the 'judgment' that fuses them. We must strive for a society where integrity leads to harmony."
      },
      {
        id: 69,        hebrew: "הַשָּׁמַיִם מְסַפְּרִים כְּבוֹד־אֵל",
        translation: "The heavens declare the glory of God.",
        source: "Psalm 19:1",
        reflection: "Nature is a window into the Divine. Looking at the vastness of the sky or the complexity of the universe can instill a sense of awe and spiritual perspective on the Creator's mastery."
      },
      {
        id: 70,        hebrew: "יְהוָה אוֹרִי וְיִשְׁעִי מִמִּי אִירָא",
        translation: "Hashem is my light and my salvation; whom shall I fear?",
        source: "Psalm 27:1",
        reflection: "Recited during the High Holiday season (Elul), this Psalm reminds us that fear is often a result of feeling alone in the dark. When you perceive the Almighty as your personal 'light,' fear dissipates because you can see your path clearly."
      },
      {
        id: 71,        hebrew: "לֵב טָהוֹר בְּרָא־לִי אֱלֹהִים",
        translation: "Create in me a pure heart, O God.",
        source: "Psalm 51:12",
        reflection: "King David, after his moral failure, does not ask for riches or victory, but for a spiritual reset. We always have the ability to do Teshuvah and ask for a fresh start and a cleansed conscience."
      },
      {
        id: 72,        hebrew: "לִמְנוֹת יָמֵינוּ כֵּן הוֹדַע",
        translation: "Teach us to number our days.",
        source: "Psalm 90:12",
        reflection: "Awareness of mortality is not meant to be morbid, but motivating. Realizing our time is limited forces us to prioritize what truly matters—Torah, family, and good deeds—and not waste days on trivialities."
      },
      {
        id: 73,        hebrew: "כָּל הָעוֹלָם כֻּלּוֹ גֶּשֶׁר צַר מְאֹד",
        translation: "The whole world is a very narrow bridge.",
        source: "Rebbe Nachman of Breslov",
        reflection: "Rebbe Nachman's famous teaching continues: '...and the main thing is not to be afraid at all.' Life is full of danger and instability, but the key to crossing the bridge is to maintain your courage and focus."
      },
      {
        id: 74,        hebrew: "שִׂנְאָה תְּעוֹרֵר מְדָנִים וְעַל כָּל־פְּשָׁעִים תְּכַסֶּה אַהֲבָה",
        translation: "Hatred stirs up strife, but love covers all offenses.",
        source: "Proverbs 10:12",
        reflection: "Focusing on hatred (Sinat Chinam) only fuels conflict. Love (Ahavat Chinam) doesn't necessarily ignore problems, but it provides a covering—a context of safety—within which problems can be solved without destroying relationships."
      },
      {
        id: 75,        hebrew: "מַעֲנֶה־רַּךְ יָשִׁיב חֵמָה",
        translation: "A soft answer turns away wrath.",
        source: "Proverbs 15:1",
        reflection: "When faced with anger, the natural instinct is to fight back. Wisdom is knowing that lowering your volume and softening your tone is actually the most powerful weapon to diffuse a fight."
      },
      {
        id: 76,        hebrew: "חֲנֹךְ לַנַּעַר עַל־פִּי דַרְכּוֹ",
        translation: "Train a child according to his way.",
        source: "Proverbs 22:6",
        reflection: "Education (Chinuch) is not one-size-fits-all. To truly teach someone, you must understand their unique nature ('his way') and tailor your guidance to their specific strengths and weaknesses."
      },
      {
        id: 77,        hebrew: "טוֹב שֵׁם מִשֶּׁמֶן טוֹב",
        translation: "A good name is better than fine oil.",
        source: "Ecclesiastes 7:1",
        reflection: "Fine oil was a luxury item of the ancient world. King Solomon teaches that your reputation (Shem Tov)—the integrity associated with your name—is more valuable than any status symbol."
      },
      {
        id: 78,        hebrew: "אַל תִּפְרוֹשׁ מִן הַצִּבּוּר",
        translation: "Do not separate yourself from the community.",
        source: "Pirkei Avot 2:5",
        reflection: "Hillel warns against isolation. Even if the community is flawed, remaining connected ensures you stay grounded, supported, and able to contribute to the Klal (the collective)."
      },
      {
        id: 79,        hebrew: "הֱוֵי עַז כַּנָּמֵר",
        translation: "Be bold as a leopard.",
        source: "Pirkei Avot 5:20",
        reflection: "Religious living requires boldness. You shouldn't be embarrassed to do the right thing, even if it is unpopular. Have the 'audacity' of a leopard when it comes to doing the will of Hashem."
      },
      {
        id: 80,        hebrew: "מִצְוָה גּוֹרֶרֶת מִצְוָה",
        translation: "One Mitzvah leads to another Mitzvah.",
        source: "Pirkei Avot 4:2",
        reflection: "Don't worry about doing something huge; just do one small good thing. The spiritual momentum of that single act will naturally propel you toward the next one, creating a positive chain reaction."
      },
      {
        id: 81,        hebrew: "דַּע מֵאַיִן בָּאתָ וּלְאָן אַתָּה הוֹלֵךְ",
        translation: "Know from where you came and to where you are going.",
        source: "Pirkei Avot 3:1",
        reflection: "Akavya ben Mahalalel gives the formula for humility and purpose. Remembering your origin (dust) keeps you humble; remembering your ultimate destination (standing before the King of Kings) keeps you focused on what truly matters."
      },
      {
        id: 82,        hebrew: "צַדִּיק בֶּאֱמוּנָתוֹ יִחְיֶה",
        translation: "The righteous shall live by his faith.",
        source: "Habakkuk 2:4",
        reflection: "The Talmud suggests that all 613 commandments can be distilled into this one principle. A life of meaning is sustained by Emunah (faith)—the steadfast belief that life has purpose and God is involved in our destiny."
      },
      {
        id: 83,        hebrew: "יְהִי כְבוֹד חֲבֵרְךָ חָבִיב עָלֶיךָ כְּשֶׁלָּךְ",
        translation: "Let the honor of your fellow be as dear to you as your own.",
        source: "Pirkei Avot 2:10",
        reflection: "Rabbi Eliezer teaches that empathy must extend to dignity. We guard our own reputation and feelings fiercely; we must be just as vigilant in protecting the dignity of others."
      },
      {
        id: 84,        hebrew: "ויהיו כל בני אדם גדולים בעיניך, ותכבדם. ואם יהיה עני או מכוער, אל תבזהו, פן תבזה את קונו.",
        translation: "Let all people be great in your eyes, and honor them. If a person is poor or unattractive, do not despise them, lest you despise their Creator.",
        source: "Sefer HaYirah",
        reflection: "This is the ultimate antidote to ego. Rabbeinu Yonah teaches that every person has a unique quality or struggle that makes them superior to you in some regard. By honoring even the most marginalized individuals, you aren't just being 'nice'; you are acknowledging the Divine artist behind the creation and recognizing that every soul is an infinite masterpiece."
      },
      {
        id: 85,        hebrew: "הוי בורח מן הכבוד, והתרחק מן הגאווה, כי היא תועבת השם. וכל המתגאה ביופיו או בחכמתו, הרי הוא כמודה שאינו מאת השם.",
        translation: "Flee from honor and distance yourself from pride, for it is an abomination to Hashem. Anyone who takes pride in their beauty or wisdom acts as if these gifts were not granted by God.",
        source: "Sefer HaYirah",
        reflection: "True character is built in the absence of an audience. When we chase honor, we become slaves to the shifting perceptions of others. Rabbeinu Yonah reminds us that our talents and traits are 'entrusted goods' from the Creator; pride is essentially a form of spiritual theft, claiming credit for a gift we didn't create ourselves."
      },
      {
        id: 86,        hebrew: "ואל תכעס ואל תקצף, כי הכעס מוציא את האדם מן העולם. ואם יקניטך אדם, תן לו מענה רך, והעבר על מידותיך.",
        translation: "Do not be angry and do not be fuming, for anger removes a person from the world. If someone provokes you, give a soft answer and overlook the offense.",
        source: "Sefer HaYirah",
        reflection: "Anger is described by the Sages as a form of temporary insanity that blinds us to truth and God's presence. Rabbeinu Yonah teaches that the peak of self-mastery is responding to provocation with softness. By 'overlooking' (Ma'avir al Midotav), we mirror the Divine quality of mercy, showing that we are larger than the petty insults thrown our way."
      },
      {
        id: 87,        hebrew: "הוי מקדים שלום לכל אדם, ואילו לנכרי בשוק. ואם הקדימך אדם בשלום, השב לו בנחת רוח ובפנים מאירות.",
        translation: "Be the first to greet every person with peace, even a stranger in the marketplace. If someone greets you first, respond with a pleasant spirit and a shining countenance.",
        source: "Sefer HaYirah",
        reflection: "Rabbeinu Yonah emphasizes that 'Shalom' is not just a greeting, but a tool for creating harmony in the world. Being the first to speak shows that you value the other person's existence. A 'shining countenance' (Panim Meirot) reflects a soul that is at peace with itself and seeks to share that light with others, regardless of who they are."
      },
      {
        id: 88,        hebrew: "עשה חסד עם מי שצריך לו, בין בגופך בין בממונך. ואל תאמר 'מה לי ולצרה הזאת', כי לכך נוצרת.",
        translation: "Perform acts of kindness for whoever needs it, whether with your body or your money. Do not say, 'What does this trouble have to do with me?' for it was for this purpose that you were created.",
        source: "Sefer HaYirah",
        reflection: "This teaching challenges the instinct of indifference. We often view the problems of others as an inconvenience or 'not our business.' Rabbeinu Yonah flips this perspective: serving others is the very definition of our life's mission. Kindness (Chessed) is not an optional extra; it is the fundamental reason for our existence."
      },
      {
        id: 89,        hebrew: "הדרך הישרה היא מדה בינונית שבכל דעה ודעה מכל הדעות שיש לו לאדם. והיא הדעה הרחוקה משני הקצוות ריחוק שוה.",
        translation: "The straight path is the middle trait within every character quality that a person possesses. It is the temperament which is equidistant from the two extremes.",
        source: "Rambam (Mishneh Torah, Hilchot De'ot 1:4)",
        reflection: "The Rambam’s 'Golden Path' is a guide for emotional stability. Being a better person isn't about extreme asceticism or extreme indulgence, but about balance. True morality is found in the center—knowing when to be firm and when to be soft, when to spend and when to save, and how to navigate the complex world with moderation."
      },
      {
        id: 90,        hebrew: "שורש הכל הוא להרגיל את עצמו להיות מהנותנים ולא מהנוטלים.",
        translation: "The root of everything is to habituate oneself to be among the givers and not among the takers.",
        source: "Rav Eliyahu Dessler (Michtav Me'Eliyahu)",
        reflection: "Rav Dessler identifies two primary orientations toward life: the Giver and the Taker. Being a good human being starts with a shift in consciousness—looking at every situation and asking, 'What can I contribute?' rather than 'What can I get?' When we give, we mirror the Creator, who is the ultimate Giver."
      },
      {
        id: 91,        hebrew: "הוי זהיר במשאך ובמתנך שיהיה באמונה. ואל תגזול ואל תעשוק ואל תסיג גבול רעך.",
        translation: "Be careful that your business dealings are conducted with integrity. Do not rob, do not exploit, and do not encroach upon the boundary of your fellow.",
        source: "Sefer HaYirah",
        reflection: "Holiness is found in the marketplace just as much as in the synagogue. Rabbeinu Yonah reminds us that daily morality is tested most acutely in how we handle money. Integrity (Emunah) in business means that our 'yes' is yes and our 'no' is no, ensuring that our success is never built on the loss or exploitation of another."
      },
      {
        id: 92,        hebrew: "השמחה היא שער גדול לעבודת השם. וצריך האדם להיות בשמחה תמיד, ובפרט בעת עשיית המצוות.",
        translation: "Joy is a great gate to the service of Hashem. A person should always be in a state of joy, especially while performing the commandments.",
        source: "Orchot Tzaddikim (The Gate of Joy)",
        reflection: "Morality without joy can become heavy and robotic. The Sages teach that joy (Simcha) is a spiritual engine. When we perform acts of goodness with a happy heart, we elevate the act itself. Joy is not a result of our circumstances, but a choice in how we approach our duties to God and our fellow man."
      },
      {
        id: 93,        hebrew: "עיקר עבודת האדם בעולם הזה היא לשבור את מדותיו הרעות.",
        translation: "The essence of a person's work in this world is to break their negative character traits.",
        source: "Vilna Gaon",
        reflection: "The Vilna Gaon provides a sobering focus: the purpose of our life is self-refinement. We all come into the world with certain 'rough edges'—ego, jealousy, or a quick temper. Life is the workshop where we use the tools of Torah and introspection to smooth those edges and transform ourselves into better versions of who we are."
      },
      {
        id: 94,        hebrew: "כל אדם צריך לדעת שיש לו נר דולק בתוכו, ואין נרו שלו כנר חברו.",
        translation: "Every person must know that they have a candle burning within them, and their candle is not like their fellow's candle.",
        source: "Rav Kook",
        reflection: "To be a better person, you must recognize your own unique value without comparing yourself to others. Rav Kook reminds us that every soul has a specific 'light' to bring to the world. True morality includes respecting your own unique path and potential, while honoring the fact that everyone else has a different light that the world also needs."
      },
      {
        id: 95,        hebrew: "אם אין אני משנה את עצמי, איך אשנה את העולם?",
        translation: "If I do not change myself, how can I change the world?",
        source: "Rabbi Israel Salanter",
        reflection: "The Mussar movement, founded by Rabbi Salanter, emphasizes that global change begins with the individual. We often look at the flaws in society and want to fix them, but the most effective way to improve the world is to model the behavior we want to see. Personal integrity is the seed of communal transformation."
      },
      {
        id: 96,        hebrew: "תקן דבריך והזהר מאוד פן תכזב, כי הכזב תועבת השם יתברך. ויהיה פיך ולבך שווים.",
        translation: "Perfect your speech and be very careful lest you lie, for falsehood is an abomination to the Blessed Name. Let your mouth and your heart be at one.",
        source: "Sefer HaYirah",
        reflection: "Rabbeinu Yonah addresses the gap between our internal thoughts and our external words. To be 'whole' (Tamim), our heart and mouth must match. Honesty isn't just about not telling major lies; it’s about the integrity of being consistent. When you speak with truth, you become a vessel for the Divine presence, which is defined as Truth itself."
      },
      {
        id: 97,        hebrew: "תקדים שלום לכל אדם. ואל תהי מוציא דבה, ואל תקבל לשון הרע.",
        translation: "Greet every person first. Do not spread gossip, and do not accept evil speech.",
        source: "Sefer HaYirah",
        reflection: "This teaching emphasizes the two sides of speech: positive initiative and negative restraint. Greeting someone shows kindness, but protecting someone's reputation in their absence is a deeper act of character. To 'not accept' Lashon Hara means actively choosing to believe the best of people, even when others are trying to plant seeds of doubt in your mind."
      },
      {
        id: 98,        hebrew: "תתנהג תמיד לדבר כל דבריך בנחת, לכל אדם ובכל עת, ובזה תנצל מן הכעס.",
        translation: "Always conduct yourself to speak all your words gently, to every person and at all times, and by this you will be saved from anger.",
        source: "Igeret HaRamban",
        reflection: "This famous advice from Nachmanides (Ramban) provides a practical 'hack' for character development. He suggests that if you force your voice to be quiet and gentle, your internal anger will naturally dissipate. Gentleness is not a sign of weakness; it is a sign of supreme self-control. It allows you to navigate conflicts with dignity rather than impulse."
      },
      {
        id: 99,        hebrew: "והווי משתתף בצער חברך, ושמח בשמחתו, ואהוב אותו כנפשך.",
        translation: "Participate in the pain of your fellow, rejoice in their joy, and love them as your own soul.",
        source: "Sefer HaYirah",
        reflection: "Empathy is the cornerstone of Jewish ethics. Rabbeinu Yonah moves beyond the basic command of 'Love your neighbor' to explain *how* to do it: by emotionally linking your destiny to theirs. When a friend succeeds, feel as though you won; when they suffer, feel their weight. This erodes the barrier of ego and builds a truly unified community."
      },
      {
        id: 100,        hebrew: "יסוד החסידות ושורש העבודה התמימה הוא שיסדיר האדם ויאמת אצלו מה חובתו בעולמו.",
        translation: "The foundation of piety and the root of perfect service is for a person to clarify and verify for themselves what their duty is in their world.",
        source: "Mesillat Yesharim (Path of the Just, Ch. 1)",
        reflection: "Rabbi Moshe Chaim Luzzatto (The Ramchal) teaches that a moral life begins with clarity of purpose. If we don't know why we are here, we wander aimlessly through life's distractions. Being a 'good human being' requires sitting down and asking: 'What does God want from me in this specific moment?' Clarity leads to consistency."
      },
      {
        id: 101,        hebrew: "כָּל הַמְרַחֵם עַל הַבְּרִיּוֹת, מְרַחֲמִים עָלָיו מִן הַשָּׁמָיִם.",
        translation: "Whoever is merciful to others, mercy is shown to them from Heaven.",
        source: "Talmud (Shabbat 151b)",
        reflection: "This is a fundamental spiritual law: our treatment of others acts as a mirror for how the Universe treats us. If we want God to be patient with our mistakes, we must be patient with the mistakes of our coworkers, family, and neighbors. Our compassion below opens the gates of compassion above."
      },
      {
        id: 102,        hebrew: "כל ישראל צריכים להיות אוהבים זה את זה כאיש אחד חברים.",
        translation: "All of Israel must love one another as 'one man, companions.'",
        source: "The Chofetz Chaim (Ahavat Yisrael)",
        reflection: "The Chofetz Chaim dedicated his life to the laws of speech and love. He teaches that we should view the Jewish people as a single body. If the left hand is injured, the right hand doesn't judge it—it helps it. Love for a fellow Jew is not an abstract concept; it is the practical realization that we are fundamentally connected."
      },
      {
        id: 103,        hebrew: "העולם הזה הוא כמו פרוזדור בפני העולם הבא; התקן עצמך בפרוזדור, כדי שתכנס לטרקלין.",
        translation: "This world is like a corridor before the World to Come; prepare yourself in the corridor, so that you may enter the banquet hall.",
        source: "Pirkei Avot 4:16",
        reflection: "This perspective shift helps us prioritize our daily actions. If we view life as a training ground (the corridor), then challenges and moral dilemmas become opportunities to grow. We don't collect 'things' in a corridor; we prepare our character so that we are ready for the ultimate reality of closeness to God."
      },
      {
        id: 104,        hebrew: "אל תדין את חברך עד שתגיע למקומו.",
        translation: "Do not judge your fellow until you have reached their place.",
        source: "Pirkei Avot 2:4",
        reflection: "We can never truly know the internal struggles, upbringing, or pressures someone else is facing. This quote is a call for radical humility in our social interactions. Instead of judging a person's failure, we should recognize that we might have done worse had we been in their exact circumstances ('their place')."
      },
      {
        id: 105,        hebrew: "ודע כי אין לך דבר שמקרב את האדם אל השם יתברך יותר מן הענווה.",
        translation: "Know that there is nothing that brings a person closer to the Blessed Name more than humility.",
        source: "Sefer HaYirah",
        reflection: "Humility (Anavah) is not about thinking you are nothing; it is about realizing that you aren't the center of the universe. In the space created by removing our own ego, there is room for the Divine to enter. A humble person is a better person because they are open to learning, open to others, and open to God."
      },

      // --- Part VIII: Heart, Mind, and Courage ---
      {
        id: 106,        hebrew: "בְּכׇל־דְּרָכֶ֥יךָ דָעֵ֑הוּ וְ֝ה֗וּא יְיַשֵּׁ֥ר אֹֽרְחֹתֶֽיךָ׃",
        translation: "In every path you walk, know Him—and He will straighten your roads.",
        source: "Proverbs 3:6",
        reflection: "Da'ehu (know Him) is not abstract belief - it is awareness in motion, bringing God into your schedule, your conversations, and your decisions. When you walk with that da'at, your choices gain yishur (straightness): less self-deception, fewer detours, more alignment between values and action. The promise is not an easy road, but a straight one - a life that makes sense from the inside."
      },
      {
        id: 107,        hebrew: "מִֽכׇּל־מִ֭שְׁמָר נְצֹ֣ר לִבֶּ֑ךָ כִּֽי־מִ֝מֶּ֗נּוּ תּוֹצְא֥וֹת חַיִּֽים׃",
        translation: "Guard your heart more than any fortress, for from it flow the springs of life.",
        source: "Proverbs 4:23",
        reflection: "Shlomo HaMelekh calls the heart a wellspring, because everything that later becomes \"life\" (chayim) begins first as an inner thought and desire. The word \"natzor\" (guard) is active: you choose what you let linger in your mind, what you rehearse, and what you consume. Guarding the heart means building boundaries around resentment, envy, and despair before they become a personality."
      },
      {
        id: 108,        hebrew: "ט֤וֹב אֶ֣רֶךְ אַ֭פַּיִם מִגִּבּ֑וֹר וּמֹשֵׁ֥ל בְּ֝רוּח֗וֹ מִלֹּכֵ֥ד עִֽיר׃",
        translation: "Better a slow-to-anger soul than a warrior, and one who rules his spirit than one who captures a city.",
        source: "Proverbs 16:32",
        reflection: "\"Erekh apayim\" (literally \"long of nostrils\") is the Torah’s picture of a person who can breathe before they react. Capturing a city is a one-time victory; ruling your ruach - your inner wind of mood and impulse - is a daily war that makes you truly free. When you practice pausing, naming the feeling, and choosing the next word, you become mightier than your circumstances."
      },
      {
        id: 109,        hebrew: "מִגְדַּל־עֹ֭ז שֵׁ֣ם יְהֹוָ֑ה בּֽוֹ־יָר֖וּץ צַדִּ֣יק וְנִשְׂגָּֽב׃",
        translation: "The Name of Hashem is a tower of strength; the righteous run into it and rise beyond reach.",
        source: "Proverbs 18:10",
        reflection: "A tower doesn’t remove the storm; it gives you height and shelter so you can see clearly again. \"Shem\" is not just a label - it means revealed identity; running to the Name means running to prayer, truth, and values that outlast panic. The tzaddik is \"nisgav\" (lifted up) because trust raises the soul above immediate fear."
      },
      {
        id: 110,        hebrew: "רַבּ֣וֹת מַחֲשָׁב֣וֹת בְּלֶב־אִ֑ישׁ וַעֲצַ֥ת יְ֝הֹוָ֗ה הִ֣יא תָקֽוּם׃",
        translation: "Many plans churn in a person's heart, but the counsel of Hashem is what stands.",
        source: "Proverbs 19:21",
        reflection: "Plans are wise, but they are not God; this verse teaches the difference between wisdom and control. \"Machashavot\" can churn the heart into anxiety, while \"atzat Hashem\" is what actually stands, even when your schedule collapses. Do your hishtadlut with excellence, then let outcomes be guided - flexibility is a form of faith."
      },
      {
        id: 111,        hebrew: "אַֽל־תִּ֭תְהַלֵּל בְּי֣וֹם מָחָ֑ר כִּ֤י לֹֽא־תֵ֝דַ֗ע מַה־יֵּ֥לֶד יֽוֹם׃",
        translation: "Do not boast about tomorrow, for you do not know what a day will give birth to.",
        source: "Proverbs 27:1",
        reflection: "Tomorrow is called \"machar,\" but Shlomo says you don’t know what a day will \"give birth\" to - every day arrives with hidden surprises. Boasting about the future is really boasting about control, and this verse gently breaks that illusion. Humility about tomorrow makes you present today: speak less, act more, and leave room for Providence."
      },
      {
        id: 112,        hebrew: "עֵץ־חַיִּ֣ים הִ֭יא לַמַּחֲזִיקִ֣ים בָּ֑הּ וְֽתֹמְכֶ֥יהָ מְאֻשָּֽׁר׃",
        translation: "She is a Tree of Life to those who hold her fast; her supporters are made joyful.",
        source: "Proverbs 3:18",
        reflection: "Torah is called an \"etz chayim,\" a Tree of Life: it has roots (faith), a trunk (discipline), branches (wisdom), and fruit (good deeds). \"Machazikim\" means those who grip it tightly - especially when it’s inconvenient, when life is shaking. The promise is not only life, but \"me’ushar\" (deeply content): the one who supports Torah becomes steadier inside."
      },
      {
        id: 113,        hebrew: "בִּרְכַּ֣ת יְ֭הֹוָה הִ֣יא תַעֲשִׁ֑יר וְלֹֽא־יוֹסִ֖ף עֶ֣צֶב עִמָּֽהּ׃",
        translation: "The blessing of Hashem makes rich—and it adds no sorrow with it.",
        source: "Proverbs 10:22",
        reflection: "Some money makes you richer but also makes you smaller - more pressure, more fear, more \"etzev\" (sorrow). Shlomo teaches that blessing is measured by the peace it brings with it, not only the numbers it produces. Pursue brachah: the kind of success that lets you sleep, give, and stay mensch."
      },
      {
        id: 114,        hebrew: "שִׁוִּ֬יתִי יְהֹוָ֣ה לְנֶגְדִּ֣י תָמִ֑יד כִּ֥י מִֽ֝ימִינִ֗י בַּל־אֶמּֽוֹט׃",
        translation: "I set Hashem before me always; with Him at my right hand, I will not be shaken.",
        source: "Psalm 16:8",
        reflection: "\"Shiviti\" is a discipline: training your awareness so God is not an occasional thought but a constant reference point. When Hashem is \"at your right hand,\" the place of strength, you don’t become fearless - you become unshakeable. This is the inner posture that lets you walk through uncertainty without losing yourself."
      },
      {
        id: 115,        hebrew: "יִ֥הְיֽוּ־לְרָצ֨וֹן ׀ אִמְרֵי־פִ֡י וְהֶגְי֣וֹן לִבִּ֣י לְפָנֶ֑יךָ יְ֝הֹוָ֗ה צוּרִ֥י וְגֹאֲלִֽי׃",
        translation: "May the words of my mouth and the meditation of my heart be pleasing before You, Hashem, my Rock and my Redeemer.",
        source: "Psalm 19:15",
        reflection: "David asks for integrity: that what leaves his mouth matches what lives in his heart. \"Hegyon\" is the quiet inner conversation; when that conversation is clean, speech becomes clean. Making this verse your daily filter turns prayer into a craft: words become offerings, not weapons."
      },
      {
        id: 116,        hebrew: "קַוֵּ֗ה אֶל־יְ֫הֹוָ֥ה חֲ֭זַק וְיַאֲמֵ֣ץ לִבֶּ֑ךָ וְ֝קַוֵּ֗ה אֶל־יְהֹוָֽה׃",
        translation: "Hope toward Hashem; be strong and let your heart be brave—then hope again.",
        source: "Psalm 27:14",
        reflection: "David repeats \"kaveh\" because hope is not a single act - it is a decision you must renew after waiting gets heavy. \"Ya’ametz libecha\" means strengthen your heart, not your mood; courage is a heart that keeps choosing. When you hope again, you refuse to let delay become despair."
      },
      {
        id: 117,        hebrew: "יְר֣אוּ אֶת־יְהֹוָ֣ה קְדֹשָׁ֑יו כִּי־אֵ֥ין מַ֝חְס֗וֹר לִירֵאָֽיו׃",
        translation: "Revere Hashem, His holy ones, for those who revere Him lack nothing.",
        source: "Psalm 34:10",
        reflection: "Yirah is awe that puts the world back in proportion, and proportion is what calms cravings. \"Ein machsor\" doesn’t mean you’ll own everything; it means you won’t be ruled by the feeling of lack. A person who lives with awe becomes rich in sufficiency."
      },
      {
        id: 118,        hebrew: "וְהִתְעַנַּ֥ג עַל־יְהֹוָ֑ה וְיִֽתֶּן־לְ֝ךָ֗ מִשְׁאֲלֹ֥ת לִבֶּֽךָ׃",
        translation: "Delight yourself in Hashem, and He will grant the requests of your heart.",
        source: "Psalm 37:4",
        reflection: "\"V’hit’aneg\" means to take your pleasure from Hashem - make your deepest delight spiritual, not merely sensory. Then \"mishalot libecha\" changes: the heart starts asking for what it was truly built to want. The verse hints at a paradox: delight in God refines desire, and refined desire is answered."
      },
      {
        id: 119,        hebrew: "הַרְפּ֣וּ וּ֭דְעוּ כִּֽי־אָנֹכִ֣י אֱלֹהִ֑ים אָר֥וּם בַּ֝גּוֹיִ֗ם אָר֥וּם בָּאָֽרֶץ׃",
        translation: "Release and know that I am God; exalted among nations, exalted on the earth.",
        source: "Psalm 46:11",
        reflection: "\"Harpu\" (release) is the hard mitzvah of loosening your grip on control, resentment, and frantic overthinking. Only then can you \"know\" God, because knowledge requires quiet. This is how faith becomes nervous-system peace: you stop wrestling the world and start standing in it."
      },
      {
        id: 120,        hebrew: "עִבְד֣וּ אֶת־יְהֹוָ֣ה בְּשִׂמְחָ֑ה בֹּ֥אוּ לְ֝פָנָ֗יו בִּרְנָנָֽה׃",
        translation: "Serve Hashem with joy; come before Him with ringing song.",
        source: "Psalm 100:2",
        reflection: "Avodah can be done like slavery or like love; the difference is simchah. Joy is not decoration - it is fuel that makes service sustainable and beautiful. When you bring song into duty, even ordinary tasks become holy work."
      },
      {
        id: 121,        hebrew: "נֵר־לְרַגְלִ֥י דְבָרֶ֑ךָ וְ֝א֗וֹר לִנְתִיבָתִֽי׃",
        translation: "Your word is a lamp at my feet and a path-light ahead, giving me just enough glow to keep moving.",
        source: "Psalm 119:105",
        reflection: "David calls Torah a ner (lamp) for the feet, not a spotlight for the horizon - it gives enough light to take the next honest step. That is how faith reduces overwhelm: you stop demanding certainty and start practicing direction. When you live one illuminated step at a time, the whole path eventually appears behind you as a life of fidelity."
      },
      {
        id: 122,        hebrew: "יְֽהֹוָ֗ה יִשְׁמׇר־צֵאתְךָ֥ וּבוֹאֶ֑ךָ מֵ֝עַתָּ֗ה וְעַד־עוֹלָֽם׃",
        translation: "Hashem will guard your going out and your coming in, from now and forever.",
        source: "Psalm 121:8",
        reflection: "This verse blesses the in-between: the doorway, the commute, the new beginning, the uncertain ending. 'Going out' and 'coming in' are when routines break and fear sneaks in, so the promise is protection specifically where you feel least in control. Say it before you leave and when you return, and let it teach you to travel with dignity and come home with gratitude."
      },
      {
        id: 123,        hebrew: "יֵ֣צֶר סָמ֔וּךְ תִּצֹּ֖ר שָׁל֣וֹם ׀ שָׁל֑וֹם כִּ֥י בְךָ֖ בָּטֽוּחַ׃",
        translation: "A steadfast mind You keep in peace—peace—for it trusts in You.",
        source: "Isaiah 26:3",
        reflection: "Yetzar samuch is a mind that is supported and settled, not pulled by every headline and emotion. The doubled shalom hints at two kinds of wholeness: inner quiet and outer steadiness, a heart that does not leak panic into every conversation. Bitachon is not denial; it is choosing a trustworthy anchor so the mind can stop spinning and start seeing."
      },
      {
        id: 124,        hebrew: "יָבֵ֥שׁ חָצִ֖יר נָ֣בֵֽל צִ֑יץ וּדְבַר־אֱלֹהֵ֖ינוּ יָק֥וּם לְעוֹלָֽם׃",
        translation: "Grass withers, flowers fade, but the word of our God stands forever.",
        source: "Isaiah 40:8",
        reflection: "This verse is brutal honesty about what time does: it dries, fades, and humbles everything you can photograph. That is why Torah is called davar - a word that is also a thing, a reality that outlasts trends, youth, and applause. Build your identity on what stands forever, and you will suffer less when what is temporary inevitably changes."
      },
      {
        id: 125,        hebrew: "בָּר֣וּךְ הַגֶּ֔בֶר אֲשֶׁ֥ר יִבְטַ֖ח בַּיהֹוָ֑ה וְהָיָ֥ה יְהֹוָ֖ה מִבְטַחֽוֹ׃",
        translation: "Blessed is the person who trusts in Hashem; Hashem becomes their trust.",
        source: "Jeremiah 17:7",
        reflection: "First trust is something you do; then it becomes something you live inside. When Hashem is your mivtach (refuge), the heart stops searching for a human guarantee and starts practicing calm responsibility. You still act with effort, but your nervous system is not running the world."
      },
      {
        id: 126,        hebrew: "כִּֽי־קָר֥וֹב אֵלֶ֛יךָ הַדָּבָ֖ר מְאֹ֑ד בְּפִ֥יךָ וּבִֽלְבָבְךָ֖ לַעֲשֹׂתֽוֹ׃",
        translation: "For the matter is very near to you—in your mouth and in your heart—to do it.",
        source: "Deuteronomy 30:14",
        reflection: "This is the Torah's anti-escape verse: holiness is not across the ocean or in a future version of you. It is in the peh (mouth) - the next word you speak - and in the lev (heart) - the next desire you feed - and therefore in the asiyah (doing) that follows. When you feel far, remember: the distance is usually one small action."
      },
      {
        id: 127,        hebrew: "מִפְּנֵ֤י שֵׂיבָה֙ תָּק֔וּם וְהָדַרְתָּ֖ פְּנֵ֣י זָקֵ֑ן וְיָרֵ֥אתָ מֵּאֱלֹהֶ֖יךָ אֲנִ֥י יְהֹוָֽה׃",
        translation: "Rise before the gray-haired, honor the face of the elder, and revere your God.",
        source: "Leviticus 19:32",
        reflection: "Hadarta means to honor by beautifying - you make the elder's face radiant by standing and giving attention. The verse ends with yirat Elokim because respect is tested when no one is watching, and God is the One who is always watching. Honoring age trains you to honor wisdom, patience, and the long view - qualities you will need for your own future."
      },
      {
        id: 128,        hebrew: "ס֥וֹף דָּבָ֖ר הַכֹּ֣ל נִשְׁמָ֑ע אֶת־הָאֱלֹהִ֤ים יְרָא֙ וְאֶת־מִצְוֺתָ֣יו שְׁמ֔וֹר כִּי־זֶ֖ה כׇּל־הָאָדָֽם׃",
        translation: "The end of the matter, when all is heard: revere God and keep His commandments, for this is the whole human.",
        source: "Ecclesiastes 12:13",
        reflection: "Kohelet speaks like a man who tried everything and refuses to lie about what did not satisfy. He concludes that the whole human (kol ha'adam) is built from yirah (awe) and mitzvot (deeds): a reverent heart and a disciplined life. In daily terms: stop chasing what collapses, and invest in what makes you a person you respect."
      },
      {
        id: 129,        hebrew: "מַ֣יִם רַבִּ֗ים לֹ֤א יֽוּכְלוּ֙ לְכַבּ֣וֹת אֶת־הָֽאַהֲבָ֔ה וּנְהָר֖וֹת לֹ֣א יִשְׁטְפ֑וּהָ",
        translation: "Many waters cannot extinguish love, nor can rivers wash it away.",
        source: "Song of Songs 8:7",
        reflection: "Mayim rabim - many waters - are the floods of circumstance: stress, misunderstanding, distance, and disappointment. Real love in Torah is covenantal: it is not just chemistry; it is commitment that keeps choosing the beloved when the river rises. If you want love that survives, practice small loyal acts long before the storm."
      },
      {
        id: 130,        hebrew: "הֱוֵי מִתַּלְמִידָיו שֶׁל אַהֲרֹן, אוֹהֵב שָׁלוֹם וְרוֹדֵף שָׁלוֹם, אוֹהֵב אֶת הַבְּרִיּוֹת וּמְקָרְבָן לַתּוֹרָה.",
        translation: "Be among Aaron's disciples: love peace and pursue peace, love people and draw them near to Torah.",
        source: "Pirkei Avot 1:12",
        reflection: "Aharon loved peace, but he did more: he pursued it - he took initiative when pride wanted to wait. 'Mekarevan laTorah' teaches a modern truth: you cannot draw people near by pushing them away; warmth is the bridge of influence. Be a peacemaker who runs toward repair, and you will turn conflict into connection."
      },
      {
        id: 131,        hebrew: "לֹא הַמִּדְרָשׁ הוּא הָעִקָּר, אֶלָּא הַמַּעֲשֶׂה.",
        translation: "Study is not the main thing; the deed is, because wisdom must become action.",
        source: "Pirkei Avot 1:17",
        reflection: "Learning can become a beautiful addiction that never touches behavior. Avot insists that the proof of wisdom is ma'aseh: the deed that shows the heart has been changed. Each day, pick one small action that makes your Torah visible - that is how study becomes life."
      },
      {
        id: 132,        hebrew: "יָפֶה תַלְמוּד תּוֹרָה עִם דֶּרֶךְ אֶרֶץ.",
        translation: "Beautiful is Torah study together with derekh eretz—the way of the world.",
        source: "Pirkei Avot 2:2",
        reflection: "Torah with derekh eretz is not compromise; it is wholeness - a soul that can pray and also pay bills honestly. Derekh eretz includes work ethic, courtesy, and responsibility, the everyday arena where character is tested. When learning and living hold hands, your spirituality stops floating and starts walking."
      },
      {
        id: 133,        hebrew: "אִם אֵין קֶמַח אֵין תּוֹרָה; אִם אֵין תּוֹרָה אֵין קֶמַח.",
        translation: "If there is no flour, there is no Torah; if there is no Torah, there is no flour.",
        source: "Pirkei Avot 3:17",
        reflection: "The Mishnah refuses the lie that you must choose between bread and meaning. Kemach (flour) without Torah becomes survival with no compass; Torah without kemach becomes ideals with no stability. The wise life builds both: take care of the body so the soul can serve, and take care of the soul so the body knows why."
      },
      {
        id: 134,        hebrew: "מְאֹד מְאֹד הֱוֵי שְׁפַל רוּחַ.",
        translation: "Be very, very humble of spirit—keep your ego low and your soul open.",
        source: "Pirkei Avot 4:4",
        reflection: "Me'od me'od is the alarm bell against the most dangerous arrogance: the kind that feels spiritual and therefore invisible. Humility is accurate self-measurement: knowing your gifts without worshipping them. A humble person grows quickly because they can hear feedback, admit mistakes, and learn from anyone."
      },
      {
        id: 135,        hebrew: "אֵין לְךָ בֶן חוֹרִין אֶלָּא מִי שֶׁעוֹסֵק בְּתַלְמוּד תּוֹרָה.",
        translation: "No one is truly free except one who engages in Torah.",
        source: "Pirkei Avot 6:2",
        reflection: "The Sages play with charut (engraved) and cherut (freedom): what is engraved into the heart becomes your liberty. Torah frees you from being managed by appetite, by mood, and by other people's opinions. The paradox is Jewish: accepting discipline is how you stop being enslaved."
      },

      // --- Part IX: Shaarei Teshuvah ---
      {
        id: 136,        hebrew: "מִן הַטּוֹבוֹת אֲשֶׁר הֵיטִיב הַשֵּׁם יִתְבָּרַךְ עִם בְּרוּאָיו, כִּי הֵכִין לָהֶם הַדֶּרֶךְ לַעֲלוֹת מִתּוֹךְ פַּחַת מַעֲשֵׂיהֶם וְלָנוּס מִפַּח פִּשְׁעֵיהֶם.",
        translation: "Among the kindnesses of Hashem is this: He prepared a path for us to rise from the pit of our deeds and escape the snare of our rebellions.",
        source: "Shaarei Teshuvah 1:1",
        reflection: "Rabbeinu Yonah calls teshuvah a kindness prepared in advance: before you fell, a ladder was already placed in the pit. That means your worst moment is not your identity; it is a location you can climb out of. The first step is simply turning your face back - honesty, regret, and one practical change today."
      },
      {
        id: 137,        hebrew: "וְדַע, כִּי הַחוֹטֵא כַּאֲשֶׁר יִתְאַחֵר לָשׁוּב מֵחַטָּאתוֹ יִכְבַּד עָלָיו מְאֹד עָנְשׁוֹ בְּכָל יוֹם.",
        translation: "Know this: when a sinner delays returning, the weight of his consequences grows heavier day by day.",
        source: "Shaarei Teshuvah 1:2",
        reflection: "Spiritual procrastination has interest: every day you delay, the habit grows stronger and the conscience gets quieter. Rabbeinu Yonah is not trying to crush you; he is trying to save you from the slow drift that becomes a new normal. Start now, even small - the weight lightens the moment you turn."
      },
      {
        id: 138,        hebrew: "הַשֵּׁנִית, כִּי הַשּׁוֹנֶה בְּחֶטְאוֹ, תְּשׁוּבָתוֹ קָשָׁה, כִּי נַעֲשָׂה לוֹ הַחֵטְא כְּהֶתֵּר.",
        translation: "Second: one who repeats a sin finds repentance hard, for the sin begins to feel permitted.",
        source: "Shaarei Teshuvah 1:5",
        reflection: "When you repeat a wrong, it stops feeling wrong - the heart relabels it as heter (permitted) just to avoid the pain of conflict. That is why the danger of sin is not the fall but the story you tell afterward. Break the pattern early: change the environment, add accountability, and let the conscience regain its voice."
      },
      {
        id: 139,        hebrew: "אֱמֶת כִּי יֵשׁ מִן הַצַּדִּיקִים שֶׁנִּכְשָׁלִים בְּחֵטְא לִפְעָמִים, אָכֵן כּוֹבְשִׁים אֶת יִצְרָם מֵאֵת פְּנֵיהֶם.",
        translation: "It is true that even the righteous sometimes stumble, yet they press their impulse back from the start.",
        source: "Shaarei Teshuvah 1:6",
        reflection: "Even tzaddikim stumble, because being human includes friction and fatigue. Their greatness is speed and honesty: they push back the yetzer at the beginning, before it grows teeth and arguments. You do not have to win every war at the end; you can win earlier, at the first thought and the first step."
      },
      {
        id: 140,        hebrew: "וְהִנֵּה מַדְרֵגוֹת רַבּוֹת לַתְּשׁוּבָה, וּלְפִי הַמַּדְרֵגוֹת יִתְקָרֵב הָאָדָם אֶל הַקָּדוֹשׁ בָּרוּךְ הוּא.",
        translation: "There are many levels of return, and by each level a person draws nearer to the Holy One.",
        source: "Shaarei Teshuvah 1:9",
        reflection: "Teshuvah is not a switch; it is a ladder with many rungs, from small repair to deep transformation. This protects you from despair and from arrogance: you can always climb one more step, and you never finish. Ask only for the next rung today - and then actually step on it."
      },
      {
        id: 141,        hebrew: "הָעִקָּר הָרִאשׁוֹן – הַחֲרָטָה: יָבִין לְבָבוֹ כִּי רַע וָמָר עָזְבוֹ אֶת ה', וְיָשִׁיב אֶל לִבּוֹ כִּי יֵשׁ עֹנֶשׁ וְנָקָם וְשִׁלֵּם עַל הֶעָוֹן.",
        translation: "The first foundation is regret: let the heart grasp how bitter it was to leave Hashem, and remember that actions have consequence.",
        source: "Shaarei Teshuvah 1:10",
        reflection: "Charatah is not self-hatred; it is the courageous moment of truth where you stop defending the wrong. Rabbeinu Yonah wants you to taste the bitterness of distance so you stop calling poison sweet. Regret becomes holy when it turns into clarity, and clarity turns into movement."
      },
      {
        id: 142,        hebrew: "הָעִקָּר הַשֵּׁנִי – עֲזִיבַת הַחֵטְא: כִּי יַעֲזֹב דְּרָכָיו הָרָעִים וְיִגְמֹר בְּכָל לְבָבוֹ כִּי לֹא יוֹסִיף לָשׁוּב בַּדֶּרֶךְ הַזֶּה עוֹד.",
        translation: "The second foundation is leaving the sin: abandon the evil path and resolve with a whole heart not to return.",
        source: "Shaarei Teshuvah 1:11",
        reflection: "Azivat ha-chet is teshuvah's muscle: you stop doing the thing, not only feeling bad about it. A real return often requires fences - avoiding triggers, changing routines, and making a new plan for the moment of temptation. Resolution is not a mood; it is a decision you protect."
      },
      {
        id: 143,        hebrew: "הָעִקָּר הַשְּׁלִישִׁי – הַיָּגוֹן: יִשְׁתּוֹנֵן כִּלְיוֹתָיו וְיַחְשֹׁב כַּמָּה רַבָּה רָעַת מִי שֶׁהִמְרָה אֶת יוֹצְרוֹ.",
        translation: "The third foundation is sorrow: to feel deeply the wrong of rebelling against one's Creator.",
        source: "Shaarei Teshuvah 1:12",
        reflection: "Yagon is a sorrow that softens, not a sadness that paralyzes. It is the heart's way of admitting, I became smaller than I was meant to be - and that admission opens the door to repair. Let the tear become a turning: pain that stays pain is despair, but pain that becomes change is teshuvah."
      },
      {
        id: 144,        hebrew: "הַשַּׁעַר הַשֵּׁנִי – לְהוֹרוֹת הַדְּרָכִים שֶׁיִּתְעוֹרֵר הָאָדָם בָּהֶם לָשׁוּב אֶל ה'.",
        translation: "The second gate teaches the paths that awaken a person to return to Hashem.",
        source: "Shaarei Teshuvah 2:1",
        reflection: "Most people do not rebel loudly; they drift quietly. The gate of awakening teaches you how to interrupt spiritual sleep - to notice where you are numb, where you are distracted, and where you are settling. Awakening is already half the return, because a waking person can choose."
      },

      // --- Part X: Orchot Tzadikim ---
      {
        id: 145,        hebrew: "הַשַּׁעַר הָרִאשׁוֹן: נְדַבֵּר בּוֹ עַל מִדַּת הַגַּאֲוָה, כִּי הִיא פֶּתַח לָרָעוֹת רַבּוֹת.",
        translation: "The first gate speaks of pride, for it is the doorway to many evils.",
        source: "Orchot Tzadikim 1:2",
        reflection: "Orchot Tzadikim calls pride a petach, a doorway, because once ego is on the throne, every trait bends to serve it. Anger becomes self-defense, envy becomes self-pity, and cruelty becomes 'honesty'. The work is to catch ga'avah early, before it turns your whole house into its palace."
      },
      {
        id: 146,        hebrew: "הַגַּאֲוָה מִתְחַלֶּקֶת לִשְׁנֵי חֲלָקִים: הָאֶחָד גַּאֲוַת הָאָדָם בְּגוּפוֹ, וְהַחֵלֶק הַשֵּׁנִי גַּאֲוַת הָאָדָם בְּמַעֲלוֹת הַחָכְמָה וּבְמַעֲשָׂיו.",
        translation: "Pride divides into two parts: pride of the body and pride in wisdom and deeds.",
        source: "Orchot Tzadikim 1:4",
        reflection: "This is a map of ego's disguises: the body-ego that wants attention, and the spiritual-ego that wants honor for being wise and good. The second is often harder, because it can wear mitzvot as a costume. Ask yourself: am I serving the truth, or am I serving the version of me who wants to be praised for it?"
      },
      {
        id: 147,        hebrew: "גַּאֲוַת הָאָדָם בְּגוּפוֹ יֵשׁ בּוֹ שְׁנֵי חֲלָקִים: הָאֶחָד טוֹב, וְהָאֶחָד רַע.",
        translation: "Bodily pride has two parts: one good, and one harmful.",
        source: "Orchot Tzadikim 1:5",
        reflection: "The book refuses simplistic morality: even pride has a sliver of holiness when it becomes kavod (dignity) for doing what is right. But when pride becomes entitlement, it turns destructive. Use the 'good pride' to stand firm against sin and pressure - and keep the rest on a short leash."
      },
      {
        id: 148,        hebrew: "הָעֲנָוָה הִיא מִדָּה טוֹבָה, וְהִיא הִפּוּךְ הַגַּאֲוָה.",
        translation: "Humility is a good trait, the very opposite of pride.",
        source: "Orchot Tzadikim 2:2",
        reflection: "Anavah is the opposite of ga'avah because it re-centers reality: you are not the axis, you are a servant with a mission. Humility makes relationships easier because you no longer need to win every moment. In that quiet space, learning becomes possible and peace becomes natural."
      },
      {
        id: 149,        hebrew: "וּמָה הִיא הָעֲנָוָה? הִיא הַכְנָעָה וְשִׁפְלוּת הַנֶּפֶשׁ, וְחוֹשֵׁב עַצְמוֹ כְּאַיִן.",
        translation: "What is humility? It is the surrender and lowliness of the soul, seeing oneself as nothing.",
        source: "Orchot Tzadikim 2:4",
        reflection: "'I think of myself as ayin (nothing)' is not emotional annihilation; it is ego-annihilation - removing the claim of, I deserve. When you feel like a gift rather than a demand, you become lighter, kinder, and more teachable. True humility makes you strong enough to stop defending your image."
      },
      {
        id: 150,        hebrew: "הַנִּכְנָע לְאַלְמָנוֹת וּלְגֵרִים וְסוֹבֵל טָרְחָם וּמַשָּׂאָם, וְהַשּׁוֹמֵעַ חֶרְפָּתוֹ וְאֵינוֹ מֵשִׁיב מֵחֲמַת גֹּדֶל עַנְוְתָנוּתוֹ – זוֹ הִיא עֲנָוָה יְשָׁרָה מְאוֹד.",
        translation: "One who yields to widows and strangers, carries their burdens, and hears insult without reply—this is straight humility.",
        source: "Orchot Tzadikim 2:7",
        reflection: "Here humility is defined in the real world: carrying others' burdens, especially the widow and the ger, and refusing to make every insult a courtroom. That does not mean accepting abuse; it means refusing to feed the ego's need to retaliate at every friction. Humility is quiet power: the ability to stay noble when you could have been petty."
      },
      {
        id: 151,        hebrew: "הָאַהֲבָה כּוֹלֶלֶת מַעֲשִׂים רַבִּים יוֹתֵר מִכָּל הַמִּדּוֹת.",
        translation: "Love contains more deeds than any other trait.",
        source: "Orchot Tzadikim 5:2",
        reflection: "This line exposes love as an engine, not an emotion. Real ahavah overflows into deeds: generosity, patience, loyalty, and presence. If you want to know what you truly love, look at what you consistently do."
      },
      {
        id: 152,        hebrew: "הָרַחֲמִים. זֹאת הַמִּדָּה הִיא מְשֻׁבַּחַת מְאוֹד.",
        translation: "Mercy—this trait is exceedingly praiseworthy.",
        source: "Orchot Tzadikim 7:2",
        reflection: "Rachamim is related to rechem (womb): a mercy that holds, protects, and makes room for growth. Compassion is a form of strength, because it refuses to reduce a person to their worst moment. Practice mercy in speech and in judgment, and you will slowly become a person others can breathe around."
      },
      {
        id: 153,        hebrew: "הַשִּׂמְחָה. הַמִּדָּה הַזֹּאת בָּאָה לָאָדָם מֵחֲמַת רֹב שַׁלְוָה בְּלִבּוֹ בְּלִי פֶּגַע רַע.",
        translation: "Joy comes from inner tranquility, when the heart is not wounded by harm.",
        source: "Orchot Tzadikim 9:2",
        reflection: "Orchot Tzadikim ties simchah to shalvah (inner ease): when the heart is not bleeding from envy, resentment, or fear, joy can settle. That means joy is not entertainment; it is healing. The daily work is to remove the inner thorns - and then joy arrives like a natural spring."
      },

      // --- Part XI: Iggeret HaRamban ---
      {
        id: 154,        hebrew: "וְכַאֲשֶׁר תִּנָּצֵל מִן הַכַּעַס, תַּעֲלֶה עַל לִבְּךָ מִדַּת הָעֲנָוָה, שֶׁהִיא מִדָּה טוֹבָה מִכָּל מִדּוֹת טוֹבוֹת.",
        translation: "When you are rescued from anger, humility rises in your heart—the finest of all traits.",
        source: "Iggeret HaRamban 3",
        reflection: "Anger is the ego's lightning: it demands the world obey now. The Ramban teaches that when anger leaves, humility enters, because the heart no longer needs to prove it is the center. If you want anavah, start by slowing your reaction and softening your tone - calm is the doorway."
      },
      {
        id: 155,        hebrew: "וּבַעֲבוּר הָעֲנָוָה, תַּעֲלֶה עַל לִבְּךָ מִדַּת הַיִּרְאָה, כִּי תִתֵּן אֶל לִבְּךָ תָּמִיד: מֵאַיִן בָּאתָ, וּלְאַן אַתָּה הוֹלֵךְ.",
        translation: "Through humility comes awe: keep before your heart—where you came from and where you are going.",
        source: "Iggeret HaRamban 4",
        reflection: "The Ramban gives two questions that slice through fantasy: where did you come from, and where are you going. They are not meant to depress you; they are meant to place life in proportion so you stop acting like a temporary thing is ultimate. Humility breeds yirah - awe - because you suddenly feel the vastness of what you stand inside."
      },
      {
        id: 156,        hebrew: "וְעַתָּה בְּנִי דַע וּרְאֵה, כִּי הַמִּתְגָּאֶה בְּלִבּוֹ עַל הַבְּרִיוֹת – מוֹרֵד הוּא בְּמַלְכוּת שָׁמַיִם.",
        translation: "Know and see: one who exalts himself over people rebels against the kingship of Heaven.",
        source: "Iggeret HaRamban 6",
        reflection: "To look down on people is to crown yourself, and that is a rebellion against the true King. The Ramban is saying: arrogance is not only rude; it is spiritually false. Treating others with honor is a way of returning the crown to Heaven and keeping your own soul clean."
      },
      {
        id: 157,        hebrew: "עַל כֵּן אַפָרֵשׁ לְךָ אֵיךְ תִּתְנַהֵג בְּמִדַּת הָעֲנָוָה, לָלֶכֶת בָּהּ תָּמִיד: כָּל דְבָרֶיךָ יִהְיוּ בְּנַחַת, וְרֹאשְׁךָ כָּפוּף; וְעֵינֶךָ יַבִּיטוּ לְמַטָּה לָאָרֶץ, וְלִבְּךָ לְמַעֲלָה.",
        translation: "Therefore I explain how to walk in humility always: let your words be gentle, your head bowed, your eyes lowered, and your heart lifted upward.",
        source: "Iggeret HaRamban 8",
        reflection: "This is a weekly practice, not poetry: speak gently, lower the head, lower the eyes, lift the heart. The body is a doorway to the soul; by training your posture and speech, you train your inner world to be patient and respectful. The goal is not to act small, but to act soft - and that softness becomes real humility."
      },
      {
        id: 158,        hebrew: "בְּכָל דְּבָרֶיךָ וּמַעֲשֶֹיךָ וּמַחְשְׁבוֹתֶיךָ, וּבְכָל עֵת – חֲשׁוֹב בְּלִבָּךְ כְּאִלוּ אַתָּה עוֹמֵד לִפְנֵי הַקָּדוֹשׁ בָּרוּךְ הוּא וּשְׁכִינָתוֹ עָלֶיךָ, כִּי כְּבוֹדוֹ מָלֵא הָעוֹלָם.",
        translation: "In all your words, deeds, and thoughts, imagine you stand before the Holy One, for His glory fills the world.",
        source: "Iggeret HaRamban 9",
        reflection: "Imagine living with the awareness that you are always in the Presence - not as paranoia, but as dignity. When you stand before the King, you choose words more carefully, you make cleaner decisions, and you waste less time pretending. This is the Ramban's method for refining thought, speech, and action in one stroke."
      },

      // --- Part XII: Mesillat Yesharim ---
      {
        id: 159,        hebrew: "וְהִנֵּה מָה שֶׁהוֹרוּנוּ חֲכָמֵינוּ זִכְרוֹנָם לִבְרָכָה הוּא, שֶׁהָאָדָם לֹא נִבְרָא אֶלָּא לְהִתְעַנֵּג עַל ה' וְלֵהָנוֹת מִזִּיו שְׁכִינָתוֹ.",
        translation: "Our Sages taught that a person was created only to delight in Hashem and enjoy the radiance of His Presence.",
        source: "Mesillat Yesharim 1:2",
        reflection: "Ramchal does not condemn pleasure; he redeems it by pointing to its deepest form. If a person is built to delight, then shallow pleasures will never fully satisfy, because they do not touch the soul's root. Aim your joy toward what is eternal, and even ordinary life becomes lit from within."
      },
      {
        id: 160,        hebrew: "אַךְ הַדֶּרֶךְ כְּדֵי לְהַגִּיעַ אֶל מְחוֹז חֶפְצֵנוּ זֶה, הוּא זֶה הָעוֹלָם.",
        translation: "The path to that destination is this world.",
        source: "Mesillat Yesharim 1:3",
        reflection: "The world is the derekh, the road, not the destination - a place to earn, to repair, and to become. When you mistake the road for the goal, you start collecting distractions instead of building character. Use the world as a tool, and it will carry you forward instead of owning you."
      },
      {
        id: 161,        hebrew: "הִנֵּה עִנְיַן הַזְּהִירוּת הוּא שֶׁיִּהְיֶה הָאָדָם נִזְהָר בְּמַעֲשָׂיו וּבְעִנְיָנָיו, כְּלוֹמַר, מִתְבּוֹנֵן וּמְפַקֵּחַ עַל מַעֲשָׂיו וּדְרָכָיו.",
        translation: "Watchfulness means being careful with one's deeds and affairs—examining and supervising one's ways.",
        source: "Mesillat Yesharim 2:1",
        reflection: "Zehirut is spiritual attention: watching your deeds the way a careful driver watches the road. Most damage happens on autopilot, when habits run the day and the conscience is asleep. A few minutes of daily reflection turns life from drifting to direction."
      },
      {
        id: 162,        hebrew: "וְהִנֵּה זֶה דָּבָר שֶׁהַשֵּׂכֶל יְחַיְּבֵהוּ וַדַּאי. כִּי אַחֲרֵי שֶׁיֵּשׁ לָאָדָם דֵּעָה וְהַשְׂכֵּל לְהַצִּיל אֶת עַצְמוֹ וְלִבְרֹחַ מֵאֲבַדּוֹן נִשְׁמָתוֹ, אֵיךְ יִתָּכֵן שֶׁיִּרְצֶה לְהַעֲלִים עֵינָיו מֵהַצָּלָתוֹ,",
        translation: "The intellect surely obligates this: if a person can rescue their own soul, how could they ignore that rescue?",
        source: "Mesillat Yesharim 2:2",
        reflection: "Ramchal argues like a philosopher and like a therapist: ignoring your soul is irrational self-harm. If you have the capacity to rescue yourself, refusing to look is not humility - it is avoidance. The first act of growth is simply to take yourself seriously enough to pay attention."
      },
      {
        id: 163,        hebrew: "הָאַחַת, שֶׁיִּתְבּוֹנֵן מַהוּ הַטּוֹב הָאֲמִתִּי שֶׁיִּבְחַר בּוֹ הָאָדָם, וְהָרַע הָאֲמִתִּי שֶׁיָּנוּס מִמֶּנּוּ.",
        translation: "First, discern the true good to choose and the true evil to flee.",
        source: "Mesillat Yesharim 3:2",
        reflection: "Not everything sweet is tov, and not everything bitter is ra. The Ramchal calls you to define good and evil by truth and outcome, not by impulse and comfort. Ask: will this make me more alive and more straight, or smaller and more trapped?"
      },
      {
        id: 164,        hebrew: "וְהַשְּׁנִיָּה, עַל הַמַּעֲשִׂים אֲשֶׁר הוּא עוֹשֶׂה לִרְאוֹת אִם הֵם מִכְּלַל הַטּוֹב אוֹ מִכְּלַל הָרַע.",
        translation: "Second, examine the deeds you do, to see if they belong to the good or the bad.",
        source: "Mesillat Yesharim 3:3",
        reflection: "This is cheshbon hanefesh in one line: take inventory of your actions and label them honestly. Without review, the soul drifts a millimeter a day, and eventually wakes up far away. Small, regular audits keep the compass true."
      },
      {
        id: 165,        hebrew: "הִנֵּה מָה שֶׁמֵּבִיא אֶת הָאָדָם אֶל הַזְּהִירוּת, הוּא לִמּוּד הַתּוֹרָה.",
        translation: "What brings a person to watchfulness is Torah study.",
        source: "Mesillat Yesharim 4:1",
        reflection: "Torah study is the flashlight that reveals what you have stopped noticing - habits, rationalizations, and blind spots. Learning gives you language for the inner world, and language creates choice. The more you learn, the more you can see - and what you can see, you can change."
      },
      {
        id: 166,        hebrew: "אָמְנָם עַל דֶּרֶךְ פְּרָט הַמֵּבִיא לָזֶה, הוּא הַהִתְבּוֹנְנוּת עַל חֹמֶר הָעֲבוֹדָה אֲשֶׁר חַיָּב בָּהּ הָאָדָם, וְעֹמֶק הַדִּין עָלֶיהָ.",
        translation: "A specific way to reach it is to contemplate the weight of the service and the depth of judgment upon it.",
        source: "Mesillat Yesharim 4:2",
        reflection: "Ramchal wants gravity, not panic. When you contemplate the weight of avodah and the depth of din, you stop wasting energy on nonsense and start choosing what matters. Seriousness is not sadness; it is clarity."
      },
      {
        id: 167,        hebrew: "אַחַר הַזְּהִירוּת יָבוֹא הַזְּרִיזוּת, כִּי הַזְּהִירוּת סוֹבֵב עַל הַ״לֹּא תַעֲשֶׂה״ וְהַזְּרִיזוּת עַל הָ״עֲשֵׂה״.",
        translation: "After watchfulness comes zeal: watchfulness guards the 'do not,' and zeal drives the 'do.'",
        source: "Mesillat Yesharim 6:1",
        reflection: "Zehirut is the brake: do not crash. Zerizut is the gas: do not stall. Holiness requires both - restraint from wrong and momentum toward good - because a neutral life quietly slides backward. Build zeal for the good, and you will surprise yourself with how much light you can bring."
      },
      {
        id: 168,        hebrew: "וְעִנְיָנוֹ שֶׁל הַזְּרִיזוּת מְבֹאָר, שֶׁהוּא הַהַקְדָּמָה לַמִּצְוֹת וּלְהַשְׁלָמַת עִנְיָנָם.",
        translation: "Zeal is the readiness to do mitzvot promptly and bring them to completion.",
        source: "Mesillat Yesharim 6:2",
        reflection: "Zerizut means promptness and completion: start the mitzvah, finish the mitzvah. Many souls die in the space between intention and execution, where procrastination pretends to be wisdom. Do it now, and do it fully - that is how a life becomes whole."
      },

      // --- Part XIII: Chovot HaLevavot ---
      {
        id: 169,        hebrew: "אַךְ מַהוּת הַבִּטָּחוֹן הִיא מְנוּחַת נֶפֶשׁ הַבּוֹטֵחַ וְשֶׁיִּהְיֶה לִבּוֹ סָמוּךְ עַל מִי שֶׁבָּטַח עָלָיו שֶׁיַּעֲשֶׂה הַטּוֹב וְהַנָּכוֹן לוֹ בָּעִנְיָן אֲשֶׁר יִבְטַח עָלָיו כְּפִי יְכָלְתּוֹ וְדַעְתּוֹ בְּמָה שֶׁמֵּפִיק טוֹבָתוֹ.",
        translation: "The essence of trust is a calm soul, a heart that leans on the One it trusts to do what is truly good.",
        source: "Duties of the Heart, Fourth Treatise on Trust 1:1",
        reflection: "Rabbeinu Bachya defines bitachon as menuchat nefesh - inner rest - not as a guarantee that nothing will hurt. You still do your hishtadlut, but you stop worshipping outcomes. Trust is the skill of letting the heart lean on the One who sees the whole picture."
      },
      {
        id: 170,        hebrew: "אֲבָל הָעִקָּר אֲשֶׁר בַּעֲבוּרוֹ יִהְיֶה הַבִּטָּחוֹן מִן הַבּוֹטֵחַ הוּא שֶׁיִּהְיֶה לִבּוֹ בָּטוּחַ בְּמִי שֶׁיִּבְטַח בּוֹ שֶׁיְּקַיֵּם מָה שֶׁאָמַר וְיַעֲשֶׂה מָה שֶׁעָרַב וְיַחְשֹׁב עָלָיו הַטּוֹב בְּמָה שֶׁלֹּא הִתְנָה לוֹ וְלֹא עָרַב עֲשֹׂהוּ שֶׁיַּעֲשֵׂהוּ נְדָבָה וָחֶסֶד.",
        translation: "The core of trust is a heart confident that the One trusted will keep His word and add kindness beyond obligation.",
        source: "Duties of the Heart, Fourth Treatise on Trust 1:2",
        reflection: "This is trust as relationship: the heart expects goodness even beyond what was promised, because the One trusted is chesed itself. Living this way shifts you from fear to gratitude - you start noticing gifts instead of only threats. A trusting heart works hard, but it does not live clenched."
      },
      {
        id: 171,        hebrew: "אַךְ הַסִּבּוֹת אֲשֶׁר בָּהֶן יִתָּכֵן הַבִּטָּחוֹן מֵהַבּוֹטֵחַ עַל הַבְּרוּאִים הֵן שֶׁבַע.",
        translation: "There are seven conditions by which trust in created beings can exist.",
        source: "Duties of the Heart, Fourth Treatise on Trust 2:1",
        reflection: "The book is honest about people: they may mean well, but they are limited, changeable, and sometimes unavailable. So human trust must be earned and bounded - and disappointment often comes from expecting a person to be what only God can be. Love people, rely on them wisely, and keep your ultimate security anchored higher."
      },
      {
        id: 172,        hebrew: "אַךְ הַהַקְדָּמוֹת אֲשֶׁר בְּבֵרוּרָן וַאֲמִתָּתָן יִשְׁלַם לְאָדָם הַבִּטָּחוֹן בֵּאלֹהִים הֵן חָמֵשׁ.",
        translation: "The foundations that perfect a person's trust in God are five.",
        source: "Duties of the Heart, Fourth Treatise on Trust 3:1",
        reflection: "Bitachon is not a vibe; it is a structure, built on foundations you can name. When trust is grounded in understanding, it survives moods, headlines, and delays. If your faith feels shaky, strengthen the pillars rather than forcing the feelings."
      },
      {
        id: 173,        hebrew: "הָרִאשׁוֹן שֶׁהַבּוֹרֵא יִתְבָּרַךְ מְרַחֵם עַל הָאָדָם יוֹתֵר מִכָּל מְרַחֵם וְכָל רַחֲמִים וְחֶמְלָה שֶׁיִּהְיוּ מִזּוּלָתוֹ עָלָיו כֻּלָּם הֵם מֵרַחֲמֵי הָאֵל וְחֶמְלָתוֹ.",
        translation: "First: the Creator's mercy on a person exceeds every other mercy; all compassion flows from His compassion.",
        source: "Duties of the Heart, Fourth Treatise on Trust 3:3",
        reflection: "Every mercy you have ever received is a branch from the Root. When you recognize that, gratitude becomes more than politeness - it becomes a worldview: you are held. Remembering past compassion is how you train future calm."
      },
      {
        id: 174,        hebrew: "אָמַר הַמְחַבֵּר אַךְ מַהוּת הַבְּחִינָה הִיא הִתְבּוֹנֵן בְּסִימָנֵי חָכְמַת הַבּוֹרֵא בַּבְּרוּאִים וְשַׁעֲרָם בַּנֶּפֶשׁ כְּפִי כֹּחַ הַכָּרַת הַמַּבְחִין.",
        translation: "The essence of contemplation is to observe the signs of the Creator's wisdom in creation, according to one’s ability to perceive.",
        source: "Duties of the Heart, Second Treatise on Examination 1:1",
        reflection: "Hitbonenut (contemplation) is the art of noticing: seeing wisdom in the ordinary, design in the details, and meaning in the day. It turns life from consumption into learning, and learning into humility. A person who notices becomes harder to numb."
      },
      {
        id: 175,        hebrew: "אַךְ אִם אָנוּ חַיָּבִין לִבְחֹן בַּבְּרוּאִים אִם לֹא, נֹאמַר כִּי הַבְּחִינָה בַּבְּרוּאִים וַהֲבָאַת רְאָיָה מֵהֶם לְחָכְמַת הַבּוֹרֵא ית׳ אָנוּ חַיָּבִין בָּהּ מִן הַמֻּשְׂכָּל וּמִן הַכָּתוּב וּמִן הַקַּבָּלָה.",
        translation: "We are obligated to examine creation and bring proof of the Creator’s wisdom—from reason, from Scripture, and from tradition.",
        source: "Duties of the Heart, Second Treatise on Examination 2:1",
        reflection: "Rabbeinu Bachya says Judaism has three witnesses: the mind, the text, and the mesorah (tradition). When all three point to one truth, belief becomes sturdy and mature. This makes inquiry holy: thinking is not rebellion; it is service."
      },
      {
        id: 176,        hebrew: "הוּא שֶׁגֶּדֶר הָעֲבוֹדָה כְּנִיעַת מִי שֶׁמְּטִיבִין לוֹ לַמֵּטִיב בְּטוֹבָה שֶׁיִּגְמְלֵהוּ עַל טוֹבָתוֹ כְּפִי יְכָלְתּוֹ.",
        translation: "The boundary of service is gratitude: one who has been benefited repays the Benefactor with good, as much as they can.",
        source: "Duties of the Heart, Third Treatise on Service of God 3:2",
        reflection: "Avodah begins with hakarat hatov: you were given, so you give back. Gratitude is not only a feeling; it is an obligation to respond with the best you can offer. When you serve from gratitude, mitzvot stop feeling like burdens and start feeling like answers."
      },
      {
        id: 177,        hebrew: "אַךְ לָדַעַת אִם אָנוּ חַיָּבִין לַחְקֹר עַל הַיִּחוּד בְּדֶרֶךְ הָעִיּוּן אִם לֹא, אֹמַר, כִּי כָל מִי שֶׁיּוּכַל לַחְקֹר עַל הָעִנְיָן הַזֶּה וְהַדּוֹמֶה לוֹ מִן הָעִנְיָנִים הַמֻּשְׂכָּלִים בְּדֶרֶךְ הַסְּבָרָא הַשִּׂכְלִית חַיָּב לַחְקֹר עָלָיו כְּפִי הַשָּׂגָתוֹ וְכֹחַ הַכָּרָתוֹ.",
        translation: "Whoever can investigate the unity through reason is obligated to investigate according to their capacity.",
        source: "Duties of the Heart, First Treatise on Unity 3:1",
        reflection: "The intellect is a gift, and therefore it is a responsibility. If you can think deeply, you are obligated to use that depth to clarify faith, not to coast on slogans. The goal is not to win arguments, but to refine the mind until it becomes a vessel for unity."
      },

      // --- Part XIV: Guide for the Perplexed ---
      {
        id: 178,        hebrew: "מטרתה של התורה בכללותה היא שני דברים: א) תיקון הנפש, ב) ותיקון הגוף.",
        translation: "The Torah’s overall purpose is twofold: the repair of the soul and the repair of the body.",
        source: "Guide for the Perplexed, Part 3, Chapter 27:1",
        reflection: "Rambam insists that Torah has two tracks running together: inner repair (beliefs and character) and outer repair (how society functions). If you only pursue private spirituality, you miss half the Torah; if you only pursue social order, you miss the soul. A whole Jew aims at both: a refined heart and a repaired world."
      },
      {
        id: 179,        hebrew: "תיקון הנפש הוא שהמון העם ישיגו דעות נכונות כפי יכולתם.",
        translation: "The repair of the soul is that people attain correct beliefs, each according to their capacity.",
        source: "Guide for the Perplexed, Part 3, Chapter 27:2",
        reflection: "Correct beliefs are not one size fits all; people climb in layers, each according to their mind and life stage. This is a merciful view of growth: you are allowed to learn gradually, but you are not allowed to stop. Keep taking the next step toward truth, and your soul will keep widening."
      },
      {
        id: 180,        hebrew: "ואילו תיקון הגוף מתקיים בתיקון מצבי מחייתם אלה עם אלה.",
        translation: "The repair of the body is the repair of how people live with one another.",
        source: "Guide for the Perplexed, Part 3, Chapter 27:3",
        reflection: "Rambam calls the ethical fabric of society 'tikkun ha-guf' - because a community is like a body, and injustice is disease. How you speak, trade, judge, and treat the weak is not secondary; it is Torah's target. Repairing the world starts with repairing your next interaction."
      },

      // --- Part XV: Everyday Wisdom (Work, Focus, Self-Mastery) ---
      {
        id: 181,        hebrew: "לֵֽךְ־אֶל־נְמָלָ֥ה עָצֵ֑ל רְאֵ֖ה דְרָכֶ֣יהָ וַחֲכָֽם׃",
        translation: "Go to the ant, you lazy one; watch her ways up close, and let her quiet discipline teach you wisdom.",
        source: "Proverbs 6:6",
        reflection: "The ant has no speeches, no ego, and no supervisor - and still she moves with purpose. Shlomo teaches that wisdom is often miniature: consistency beats inspiration when it comes to building a life. When you feel unmotivated, copy the ant: do the next small task, then the next, and let momentum become your might."
      },
      {
        id: 182,        hebrew: "רָ֗אשׁ עֹשֶׂ֥ה כַף־רְמִיָּ֑ה וְיַ֖ד חָרוּצִ֣ים תַּעֲשִֽׁיר׃",
        translation: "A slack palm manufactures poverty, but the hand of the diligent creates abundance.",
        source: "Proverbs 10:4",
        reflection: "The verse contrasts a palm that is remiyah (slack, deceptive) with a yad charutzim - a 'sharp' hand that cuts straight through excuses. Diligence is not intensity once a month; it is the daily habit of showing up when no one is clapping. Wealth here is bigger than money: it is competence, reliability, and the quiet confidence that you can carry responsibility."
      },
      {
        id: 183,        hebrew: "בְּרֹ֣ב דְּ֭בָרִים לֹ֣א יֶחְדַּל־פָּ֑שַׁע וְחוֹשֵׂ֖ךְ שְׂפָתָ֣יו מַשְׂכִּֽיל׃",
        translation: "Where words multiply, sin is close behind; but the one who holds back their lips is truly wise.",
        source: "Proverbs 10:19",
        reflection: "When words overflow, the heart loses its filter, and damage slips out with ease. Restraining the lips is not repression; it is mastery - the ability to choose the right word, or the right silence. In a world of instant texts and hot takes, holiness often looks like taking one breath before you speak."
      },
      {
        id: 184,        hebrew: "עֹבֵ֣ד אַ֭דְמָתוֹ יִֽשְׂבַּֽע־לָ֑חֶם וּמְרַדֵּ֖ף רֵיקִ֣ים חֲסַר־לֵֽב׃",
        translation: "Work your own ground and you will be satisfied with bread; chase empty things and you will starve for sense.",
        source: "Proverbs 12:11",
        reflection: "The verse praises the person who works their own 'field' - the real responsibilities in front of them - rather than chasing rekim (empty things). Many people are busy, but their busyness is a pursuit of distraction, not of bread. Choose the task that feeds your life, and let fantasies stay fantasies."
      },
      {
        id: 185,        hebrew: "יַד־חָרוּצִ֥ים תִּמְשׁ֑וֹל וּ֝רְמִיָּ֗ה תִּהְיֶ֥ה לָמַֽס׃",
        translation: "The diligent hand rises to lead; the lazy hand ends up under forced labor.",
        source: "Proverbs 12:24",
        reflection: "Diligent hands end up leading, because responsibility always rises toward the person who can be trusted. Laziness does not remove work; it merely turns it into mas (forced labor) - panic, debt, and other people deciding your schedule. Discipline is the price of freedom."
      },
      {
        id: 186,        hebrew: "דְּאָגָ֣ה בְלֶב־אִ֣ישׁ יַשְׁחֶ֑נָּה וְדָבָ֖ר ט֣וֹב יְשַׂמְּחֶֽנָּה׃",
        translation: "Worry weighs a person's heart down, but one good word can lift it back to joy.",
        source: "Proverbs 12:25",
        reflection: "De'agah (worry) 'bows' the heart - it makes a person smaller inside and heavier in motion. Then Shlomo reveals a medicine that costs nothing: davar tov, a good word, which can lift a soul like air under wings. Be that word for someone else, and also learn to speak it to your own heart."
      },
      {
        id: 187,        hebrew: "מִתְאַוָּ֣ה וָ֭אַיִן נַפְשׁ֣וֹ עָצֵ֑ל וְנֶ֖פֶשׁ חָרֻצִ֣ים תְּדֻשָּֽׁן׃",
        translation: "The lazy soul craves and remains empty; the diligent soul becomes full and satisfied.",
        source: "Proverbs 13:4",
        reflection: "Desire without action creates an ache that never fills; the soul wants, but remains ayin (empty). Charutzim are 'sharp' and decisive - they turn desire into effort and effort into fullness. This is how you feed a dream: not by yearning harder, but by working faithfully."
      },
      {
        id: 188,        hebrew: "בְּכׇל־עֶ֭צֶב יִהְיֶ֣ה מוֹתָ֑ר וּדְבַר־שְׂ֝פָתַ֗יִם אַךְ־לְמַחְסֽוֹר׃",
        translation: "Every true toil leaves a surplus; mere talk ends in lack.",
        source: "Proverbs 14:23",
        reflection: "Etzev means toil that costs you something - and that cost produces motar, a surplus. Lip-service feels productive because it sounds like progress, but it often ends in machsor, in lack. If you want results, honor effort over explanation."
      },
      {
        id: 189,        hebrew: "מֵשִׁ֣יב דָּ֭בָר בְּטֶ֣רֶם יִשְׁמָ֑ע אִוֶּ֥לֶת הִיא־ל֝֗וֹ וּכְלִמָּֽה׃",
        translation: "Answering before listening is folly—and an invitation to shame.",
        source: "Proverbs 18:13",
        reflection: "Answering before hearing is the ego's way of protecting itself: it would rather be right than be true. Listening is a form of humility, and humility is the doorway to wisdom. In every relationship, the quickest upgrade is to hear fully before you respond."
      },
      {
        id: 190,        hebrew: "שְׁמַ֣ע עֵ֭צָה וְקַבֵּ֣ל מוּסָ֑ר לְ֝מַ֗עַן תֶּחְכַּ֥ם בְּאַחֲרִיתֶֽךָ׃",
        translation: "Listen to counsel, accept discipline, and your later self will be wise.",
        source: "Proverbs 19:20",
        reflection: "Musar is not punishment; it is training - the kind that makes you wise in your acharit (your later self). This verse invites you to borrow wisdom from others so you do not have to pay for every lesson with regret. The disciplined person becomes their own good future."
      },
      {
        id: 191,        hebrew: "מַ֭חֲשָׁבוֹת בְּעֵצָ֣ה תִכּ֑וֹן וּ֝בְתַחְבֻּל֗וֹת עֲשֵׂ֣ה מִלְחָמָֽה׃",
        translation: "Plans are made firm through counsel, and with strategy you fight your battles.",
        source: "Proverbs 20:18",
        reflection: "A plan becomes established when it is tested by counsel, not only imagined in private. Strategy is not lack of faith; it is respect for reality and for the complexity of life. Ask for guidance early, and you will fight fewer unnecessary wars."
      },
      {
        id: 192,        hebrew: "מַחְשְׁב֣וֹת חָ֭רוּץ אַךְ־לְמוֹתָ֑ר וְכׇל־אָ֝֗ץ אַךְ־לְמַחְסֽוֹר׃",
        translation: "The plans of the diligent lead to surplus; the rushed lead straight to shortage.",
        source: "Proverbs 21:5",
        reflection: "Charutz planning produces motar - margin, breathing room, the surplus that saves you when life shifts. Haste (atz) feels fast, but it often creates machsor: preventable shortage, mistakes, and cleanup. Slow down enough to think, and you will move faster in the long run."
      },
      {
        id: 193,        hebrew: "אַל־תִּיגַ֥ע לְֽהַעֲשִׁ֑יר מִֽבִּינָתְךָ֥ חֲדָֽל׃",
        translation: "Do not wear yourself out just to get rich—pause, and let your understanding lead.",
        source: "Proverbs 23:4",
        reflection: "There is a kind of ambition that is really exhaustion dressed up as virtue. Shlomo says: stop and use your binah - your understanding - before you trade your life for a number. Work hard, yes, but do not worship wealth; choose a success that does not steal your soul."
      },
      {
        id: 194,        hebrew: "עִ֣יר פְּ֭רוּצָה אֵ֣ין חוֹמָ֑ה אִ֝֗ישׁ אֲשֶׁ֤ר אֵ֖ין מַעְצָ֣ר לְרוּחֽוֹ׃",
        translation: "A person without self-restraint is like a city smashed open, without walls.",
        source: "Proverbs 25:28",
        reflection: "A city without walls is open to every invader; a person without ma'atzar (restraint) is open to every impulse. Ruach can mean spirit, mood, or temper - and when it has no boundaries, it rules you. Build small walls: routines, limits, and pauses, and your inner city will be safe."
      },
      {
        id: 195,        hebrew: "יְהַלֶּלְךָ֣ זָ֣ר וְלֹא־פִ֑יךָ נׇ֝כְרִ֗י וְאַל־שְׂפָתֶֽיךָ׃",
        translation: "Let a stranger praise you, not your own mouth; an outsider, not your own lips.",
        source: "Proverbs 27:2",
        reflection: "Self-praise is noisy, but it rarely convinces; it is often the ego begging for a crown. Shlomo teaches dignity: let your work speak, and let another voice name it. When you stop advertising yourself, you become free to actually become yourself."
      },
      {
        id: 196,        hebrew: "יָדֹ֣עַ תֵּ֭דַע פְּנֵ֣י צֹאנֶ֑ךָ שִׁ֥ית לִ֝בְּךָ֗ לַעֲדָרִֽים׃",
        translation: "Know well the condition of your flock; set your heart on your responsibilities.",
        source: "Proverbs 27:23",
        reflection: "Wisdom is not only lofty ideas; it is knowing the face of your flock - paying attention to what you are responsible for. Neglect often comes from vagueness, and vagueness is expensive. Look closely at your commitments, your finances, your habits, and your people - and stewardship will protect you."
      },
      {
        id: 197,        hebrew: "מְכַסֶּ֣ה פְ֭שָׁעָיו לֹ֣א יַצְלִ֑יחַ וּמוֹדֶ֖ה וְעֹזֵ֣ב יְרֻחָֽם׃",
        translation: "Covering your wrongs will not make you succeed; admitting and leaving them opens the way to mercy.",
        source: "Proverbs 28:13",
        reflection: "Covering a failure keeps it alive; confession brings it into the light where it can be changed. The verse pairs two verbs: modeh (admit) and ozev (leave) - honesty without action is just storytelling. Mercy arrives when truth becomes movement."
      },
      {
        id: 198,        hebrew: "חָזִ֗יתָ אִ֭ישׁ אָ֣ץ בִּדְבָרָ֑יו תִּקְוָ֖ה לִכְסִ֣יל מִמֶּֽנּוּ׃",
        translation: "Do you see someone hasty with words? There is more hope for a fool than for them.",
        source: "Proverbs 29:20",
        reflection: "Hasty speech is dangerous because it feels small in the moment but can be permanent in the world. Shlomo says it is worse than foolishness, because a fool might learn, but a fast tongue keeps creating new fires. If you want wisdom, slow your words down to the speed of thought."
      },
      {
        id: 199,        hebrew: "טוֹבִ֥ים הַשְּׁנַ֖יִם מִן־הָאֶחָ֑ד אֲשֶׁ֧ר יֵשׁ־לָהֶ֛ם שָׂכָ֥ר ט֖וֹב בַּעֲמָלָֽם׃",
        translation: "Two are better than one, because together their labor earns a better reward.",
        source: "Ecclesiastes 4:9",
        reflection: "Kohelet is practical: partnership multiplies strength, perspective, and resilience. Two people can carry what one person drops, and they can remind each other why the work matters. Build your life with allies, not only with goals."
      },
      {
        id: 200,        hebrew: "ט֕וֹב מְלֹ֥א כַ֖ף נָ֑חַת מִמְּלֹ֥א חׇפְנַ֛יִם עָמָ֖ל וּרְע֥וּת רֽוּחַ׃",
        translation: "Better one open handful of calm than two clenched fists full of toil and chasing wind.",
        source: "Ecclesiastes 4:6",
        reflection: "Nachat is calm, settledness - a single open hand that can actually enjoy what it holds. Two clenched fists may look productive, but they are often just re'ut ruach - chasing wind and losing peace. Choose sustainable effort, the kind that leaves you human."
      },
      {
        id: 201,        hebrew: "מְתוּקָה֙ שְׁנַ֣ת הָעֹבֵ֔ד אִם־מְעַ֥ט וְאִם־הַרְבֵּ֖ה יֹאכֵ֑ל וְהַשָּׂבָע֙ לֶֽעָשִׁ֔יר אֵינֶ֛נּוּ מַנִּ֥יחַֽ ל֖וֹ לִישֽׁוֹן׃",
        translation: "Sweet is the sleep of the one who works—whether they eat little or much; but the overfull rich cannot rest.",
        source: "Ecclesiastes 5:11",
        reflection: "Honest work has a hidden paycheck: sweet sleep and a quiet mind. Kohelet warns that abundance can become a prison, because the overfull person cannot rest - they keep guarding, calculating, and fearing loss. Measure success by the peace it buys you, not only the things it buys you."
      },
      {
        id: 202,        hebrew: "ט֛וֹב אַחֲרִ֥ית דָּבָ֖ר מֵֽרֵאשִׁית֑וֹ ט֥וֹב אֶֽרֶךְ־ר֖וּחַ מִגְּבַהּ־רֽוּחַ׃",
        translation: "Better the end of a thing than its beginning; better patience than pride.",
        source: "Ecclesiastes 7:8",
        reflection: "Beginnings are exciting, but endings reveal truth - anyone can start, few can finish. Patience is strength stretched over time, and pride is often the impatience to be seen now. If you want greatness, learn to complete what you begin."
      },
      {
        id: 203,        hebrew: "טוֹבָ֥ה חׇכְמָ֖ה מִכְּלֵ֣י קְרָ֑ב וְחוֹטֶ֣א אֶחָ֔ד יְאַבֵּ֖ד טוֹבָ֥ה הַרְבֵּֽה׃",
        translation: "Wisdom is better than weapons of war—yet one sinner can destroy much good.",
        source: "Ecclesiastes 9:18",
        reflection: "Wisdom can outmatch force, but Kohelet adds a sobering warning: one reckless person can undo months of careful work. In daily life, this means one habit, one outburst, one careless lie can erase much good. Guard the small breaches, because that is how you protect the big building."
      },
      {
        id: 204,        hebrew: "אִם־ר֤וּחַ הַמּוֹשֵׁל֙ תַּעֲלֶ֣ה עָלֶ֔יךָ מְקוֹמְךָ֖ אַל־תַּנַּ֑ח כִּ֣י מַרְפֵּ֔א יַנִּ֖יחַ חֲטָאִ֥ים גְּדוֹלִֽים׃",
        translation: "If a ruler's anger rises against you, do not abandon your place—calmness can quiet great offenses.",
        source: "Ecclesiastes 10:4",
        reflection: "When authority flares, your instinct is to flee or to fight - Kohelet advises a third path: stay steady. Marpe (calmness) is called healing because it cools the room and gives you back control of your choices. In conflict at work or at home, your calm can be the strongest form of leadership."
      },
      {
        id: 205,        hebrew: "אִם־קֵהָ֣ה הַבַּרְזֶ֗ל וְהוּא֙ לֹא־פָנִ֣ים קִלְקַ֔ל וַחֲיָלִ֖ים יְגַבֵּ֑ר וְיִתְר֥וֹן הַכְשֵׁ֖יר חׇכְמָֽה׃",
        translation: "If the iron is dull and you do not sharpen it, you must use more strength; wisdom teaches the better way.",
        source: "Ecclesiastes 10:10",
        reflection: "A dull blade demands brute force; a sharpened blade demands wisdom. Kohelet is teaching you to invest in preparation: learn the skill, set the system, sharpen the tool, then act. Working smarter is not laziness - it is the humility to admit that method matters."
      }

    ];

    function getQuoteForDate(date = new Date()) {
        const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
        const index = dayNumber % DAILY_INSPIRATION_QUOTES.length;
        return DAILY_INSPIRATION_QUOTES[index];
    }

    function formatDisplayDate(date) {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    function ensureBookmarkButton(container) {
        if (!container) {
            return null;
        }

        const existing = container.querySelector('[data-quote-bookmark]');
        if (existing) {
            return existing;
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'daily-quote-bookmark-btn';
        btn.setAttribute('data-quote-bookmark', 'true');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Save this quote');
        btn.innerHTML = `
            <span class="sr-only">Bookmark this quote</span>
            <svg class="bookmark-icon-desktop" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-7-4-7 4V4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
            <svg class="bookmark-icon-mobile" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 2h14a1 1 0 011 1v20l-8-5-8 5V3a1 1 0 011-1z" fill="currentColor"/>
            </svg>
        `;

        const contentBox = container.querySelector('.daily-inspiration-content');
        if (contentBox) {
            const actions = document.createElement('div');
            actions.className = 'daily-inspiration-actions';
            actions.appendChild(btn);
            contentBox.appendChild(actions);
        } else {
            container.appendChild(btn);
        }

        return btn;
    }

    function renderDailyInspiration() {
        const container = document.getElementById('daily-inspiration');
        if (!container) {
            return;
        }

        const quote = getQuoteForDate();
        if (!quote) {
            return;
        }

        const translationEl = container.querySelector('[data-quote-translation]');
        const hebrewEl = container.querySelector('[data-quote-hebrew]');
        const sourceEl = container.querySelector('[data-quote-source]');
        const reflectionEl = container.querySelector('[data-quote-reflection]');

        if (translationEl) {
            translationEl.textContent = quote.translation;
        }
        if (hebrewEl) {
            hebrewEl.textContent = quote.hebrew;
        }
        if (sourceEl) {
            sourceEl.textContent = quote.source || '';
        }
        if (reflectionEl) {
            reflectionEl.textContent = quote.reflection;
        }

        const displayDate = formatDisplayDate(new Date());
        const bookmarkBtn = ensureBookmarkButton(container);

        const renderedQuote = {
            ...quote,
            displayDate
        };

        container.dataset.quoteId = quote.id;
        container.dataset.quoteDate = displayDate;
        window.currentDailyQuote = renderedQuote;

        if (bookmarkBtn) {
            bookmarkBtn.dataset.quoteId = quote.id;
            bookmarkBtn.dataset.displayDate = displayDate;
            bookmarkBtn.setAttribute('aria-pressed', 'false');
            bookmarkBtn.classList.remove('is-active');
            bookmarkBtn.onclick = (event) => {
                event.stopPropagation();
                const toggleEvent = new CustomEvent('dailyQuoteBookmarkToggle', {
                    bubbles: true,
                    detail: renderedQuote
                });
                bookmarkBtn.dispatchEvent(toggleEvent);
            };
        }

        document.dispatchEvent(new CustomEvent('dailyQuoteRendered', { detail: renderedQuote }));
    }

    document.addEventListener('DOMContentLoaded', renderDailyInspiration);
})();
