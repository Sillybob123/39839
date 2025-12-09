(function() {
    'use strict';

    // Rotate through the teachings by calendar day so everyone sees the same quote.
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const DAILY_INSPIRATION_QUOTES = [
      {
        id: 1,
        hebrew: "אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם",
        translation: "Who is wise? The one who learns from every person.",
        source: "Pirkei Avot 4:1",
        reflection: "Spoken by Ben Zoma, this teaching redefines wisdom not as an accumulation of facts, but as a character trait of openness. True wisdom is realizing that everyone you meet—regardless of their status or education—has something unique to teach you."
      },
      {
        id: 2,
        hebrew: "אֵיזֶהוּ גִבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ",
        translation: "Who is mighty? The one who subdues their own impulses.",
        source: "Pirkei Avot 4:1",
        reflection: "In a world that often equates strength with physical power or dominance over others, the Sages argue that the true warrior is the one who fights the internal battle. Real strength (Gevurah) is the internal discipline to control your own anger, ego, and desires."
      },
      {
        id: 3,
        hebrew: "אֵיזֶהוּ עָשִׁיר? הַשָּׂמֵחַ בְּחֶלְקוֹ",
        translation: "Who is rich? The one who rejoices in their portion.",
        source: "Pirkei Avot 4:1",
        reflection: "Ben Zoma counters the human tendency to constantly desire what we do not have. Wealth is a state of mind; it isn't found in accumulating more things, but in cultivating gratitude (Hakarat Hatov) for what you already have."
      },
      {
        id: 4,
        hebrew: "אֵיזֶהוּ מְכֻבָּד? הַמְכַבֵּד אֶת הַבְּרִיּוֹת",
        translation: "Who is honored? The one who honors others.",
        source: "Pirkei Avot 4:1",
        reflection: "Using the term 'Briyot' (creations), this teaching implies that honoring people is honoring the Creator who made them. Respect is a boomerang; you earn it by giving it away. When you treat every human being with dignity, you elevate your own dignity."
      },
      {
        id: 5,
        hebrew: "כִּ֤י שֶׁ֨בַע יִפּ֣וֹל צַדִּ֣יק וָקָ֑ם",
        translation: "For a righteous person falls seven times, and rises again.",
        source: "Proverbs 24:16",
        reflection: "Attributed to King Solomon, this proverb observes that righteousness is not about perfection, but about persistence. Failure is not the opposite of success; it is part of success. A Tzaddik (righteous person) isn't someone who never fails, but someone who refuses to stay down."
      },
      {
        id: 6,
        hebrew: "חֲזַ֣ק וֶאֱמָ֔ץ אַֽל־תַּעֲרֹ֖ץ וְאַל־תֵּחָ֑ת",
        translation: "Be strong and courageous; do not be terrified or dismayed.",
        source: "Joshua 1:9",
        reflection: "Hashem spoke these words to Joshua after Moses died. This is the essence of 'Bitachon' (Trust in God). Courage doesn't mean you aren't afraid; it means you move forward despite your fear, trusting that Hashem is with you."
      },
      {
        id: 7,
        hebrew: "נֵ֣ר יְ֭הוָה נִשְׁמַ֣ת אָדָ֑ם",
        translation: "The soul of man is the candle of God.",
        source: "Proverbs 20:27",
        reflection: "King Solomon uses the metaphor of light. Just as a candle's purpose is to illuminate, your Neshama (soul) is a divine spark. Your purpose is to let that light shine, illuminating the darkness in your own unique way through Mitzvot and kindness."
      },
      {
        id: 8,
        hebrew: "רַחֲמָנָא לִבָּא בָּעֵי",
        translation: "The Compassionate One desires the heart.",
        source: "Sanhedrin 106b / Zohar",
        reflection: "This concept from the Sages and Jewish Mysticism emphasizes that Hashem looks past external rituals to the internal intent (Kavanah). It's not just about your actions on the outside, but your intention on the inside; sincerity and passion matter more than robotic perfection."
      },
      {
        id: 9,
        hebrew: "וְהַצְנֵ֥עַ לֶ֖כֶת עִם־אֱלֹהֶֽיךָ",
        translation: "Walk humbly with your God.",
        source: "Micah 6:8",
        reflection: "The Prophet Micah summed up the entire Torah into three requirements: Justice, Kindness, and Humility. True greatness is quiet; you don't need to broadcast your virtues, as living them with modesty (Tzniut) and integrity is enough."
      },
      {
        id: 10,
        hebrew: "בְּצֶ֥לֶם אֱלֹהִ֖ים בָּרָ֣א אֹת֑וֹ",
        translation: "In the image of God He created him.",
        source: "Genesis 1:27",
        reflection: "This fundamental definition of humanity from the Creation narrative establishes our inherent worth. Never forget your infinite value; you are a reflection of the Divine (Tzelem Elokim), as is every person you meet."
      },

      // --- Part II: Kindness & Relationships ---
      {
        id: 11,
        hebrew: "וְאָהַבְתָּ֥ לְרֵעֲךָ֖ כָּמ֑וֹךָ",
        translation: "Love your neighbor as yourself.",
        source: "Leviticus 19:18",
        reflection: "Rabbi Akiva called this the 'Great Principle of the Torah.' It teaches that we are all connected souls, and treating others with love is the ultimate expression of our humanity."
      },
      {
        id: 12,
        hebrew: "מָ֣וֶת וְ֭חַיִּים בְּיַד־לָשׁ֑וֹן",
        translation: "Death and life are in the power of the tongue.",
        source: "Proverbs 18:21",
        reflection: "The laws of Lashon Hara (evil speech) are based on this reality. Your words create worlds; you have the power to build someone up or tear them down in a single sentence. Choose to speak life."
      },
      {
        id: 13,
        hebrew: "בַּקֵּ֖שׁ שָׁל֣וֹם וְרׇדְפֵֽהוּ",
        translation: "Seek peace and pursue it.",
        source: "Psalm 34:15",
        reflection: "Written by King David, this verse teaches that peace (Shalom) requires active pursuit. Peace doesn't just happen; you have to chase after it, actively working to reconcile differences and create harmony."
      },
      {
        id: 14,
        hebrew: "יְהִי בֵיתְךָ פָתוּחַ לִרְוָחָה",
        translation: "Let your house be open wide.",
        source: "Pirkei Avot 1:5",
        reflection: "Yossi ben Yochanan lived during a time of social stratification and emphasized the home as a center of kindness (Chessed), modeled after Abraham's tent. Sharing your space and resources creates a community of kindness."
      },
      {
        id: 15,
        hebrew: "הֱוֵי דָן אֶת כָּל הָאָדָם לְכַף זְכוּת",
        translation: "Judge every person favorably.",
        source: "Pirkei Avot 1:6",
        reflection: "The Sages urge us to interpret ambiguity in others' actions positively. Give people the benefit of the doubt (Dan L'kaf Zechut); when you look for the good in others, you often bring out the best in them."
      },
      {
        id: 16,
        hebrew: "וּקְנֵה לְךָ חָבֵר",
        translation: "Acquire for yourself a friend.",
        source: "Pirkei Avot 1:6",
        reflection: "The use of the word 'acquire' implies that friendship requires an investment, much like a purchase. Friends are not just found; they are earned through effort, investment, and loyalty."
      },
      {
        id: 17,
        hebrew: "כַּ֭מַּיִם הַפָּנִ֣ים לַפָּנִ֑ים כֵּ֤ן לֵֽב־הָ֝אָדָ֗ם לָאָדָֽם",
        translation: "As water reflects the face, so one heart reflects another.",
        source: "Proverbs 27:19",
        reflection: "King Solomon observed this psychological mirroring in relationships. The energy you put out is the energy you get back—show love, and you will find it reflected in the hearts of others."
      },
      {
        id: 18,
        hebrew: "הִנֵּ֣ה מַה־טּ֭וֹב וּמַה־נָּעִ֑ים שֶׁ֖בֶת אַחִ֣ים גַּם־יָֽחַד",
        translation: "Behold, how good and how pleasant it is for brothers to dwell together in unity.",
        source: "Psalm 133:1",
        reflection: "This Song of Ascents celebrates the rare moments when all tribes stood together. There is a unique spiritual power when people set aside their differences and live in harmony; unity is a vessel for blessing."
      },
      {
        id: 19,
        hebrew: "שַׁלַּ֥ח לַחְמְךָ֖ עַל־פְּנֵ֣י הַמָּ֑יִם",
        translation: "Cast your bread upon the waters.",
        source: "Ecclesiastes 11:1",
        reflection: "King Solomon suggests taking risks in generosity (Tzedakah), even when the return isn't immediately visible. Do good without expecting an immediate reward; kindness has a ripple effect, and eventually, the good you put into the world will return to you."
      },
      {
        id: 20,
        hebrew: "כָּל יִשְׂרָאֵל עֲרֵבִים זֶה בָּזֶה",
        translation: "All of Israel are responsible for one another.",
        source: "Talmud Shavuot 39a",
        reflection: "The Sages discussed communal liability using the word 'arevim' (guarantors). We are not isolated individuals; we are part of a greater whole. When one person falls, we all feel it, and when one rises, we all rise."
      },

      // --- Part III: Action & Purpose ---
      {
        id: 21,
        hebrew: "אִם אֵין אֲנִי לִי, מִי לִי?",
        translation: "If I am not for myself, who will be for me?",
        source: "Pirkei Avot 1:14",
        reflection: "Hillel the Elder taught personal responsibility as the first step in ethical living. You must take ownership of your own life and well-being; no one else can do your work for you."
      },
      {
        id: 22,
        hebrew: "וּכְשֶׁאֲנִי לְעַצְמִי, מָה אֲנִי?",
        translation: "And if I am only for myself, what am I?",
        source: "Pirkei Avot 1:14",
        reflection: "Hillel balances his previous statement by warning that self-care without care for others leads to an empty existence. Self-care is necessary, but selfishness is empty; a meaningful life is one lived in service to others."
      },
      {
        id: 23,
        hebrew: "וְאִם לֹא עַכְשָׁיו, אֵימָתַי?",
        translation: "And if not now, when?",
        source: "Pirkei Avot 1:14",
        reflection: "Hillel concludes his famous trio of questions by warning against procrastination in spiritual matters. Stop waiting for the 'perfect time'; the only moment you truly have to make a change is this one."
      },
      {
        id: 24,
        hebrew: "לֹא עָלֶיךָ הַמְּלָאכָה לִגְמֹר, וְלֹא אַתָּה בֶן חוֹרִין לִבָּטֵל מִמֶּנָּה",
        translation: "It is not your duty to finish the work, but neither are you free to neglect it.",
        source: "Pirkei Avot 2:16",
        reflection: "Rabbi Tarfon lived through the destruction of the Temple and saw the massive task of rebuilding. He encourages us not to be paralyzed by the size of the world's problems; you don't have to fix everything (Tikkun Olam), but you must do your part."
      },
      {
        id: 25,
        hebrew: "לְפוּם צַעֲרָא אַגְרָא",
        translation: "According to the effort is the reward.",
        source: "Pirkei Avot 5:23",
        reflection: "Ben Hei Hei emphasizes that the struggle itself gives value to the achievement. The harder the struggle, the greater the spiritual growth; the value of a Mitzvah is measured by the difficulty you overcame to perform it."
      },
      {
        id: 26,
        hebrew: "וּבָחַרְתָּ֙ בַּחַיִּ֔ים",
        translation: "Therefore, choose life.",
        source: "Deuteronomy 30:19",
        reflection: "In his final address, Moses frames free will as a choice between life and death. Every day we are faced with choices that lead toward vitality and meaning or toward negativity; actively choose the path that brings life."
      },
      {
        id: 27,
        hebrew: "אֱמֹר מְעַט וַעֲשֵׂה הַרְבֵּה",
        translation: "Say little and do much.",
        source: "Pirkei Avot 1:15",
        reflection: "Shammai, often seen as strict, emphasized integrity by teaching that over-promising leads to disappointment. Promises are cheap, but action is everything; let your character be defined by what you do, not just by what you say."
      },
      {
        id: 28,
        hebrew: "כֹּ֠ל אֲשֶׁ֨ר תִּמְצָ֧א יָֽדְךָ֛ לַעֲשֹׂ֥ות בְּכֹחֲךָ֖ עֲשֵׂ֑ה",
        translation: "Whatever your hand finds to do, do it with all your might.",
        source: "Ecclesiastes 9:10",
        reflection: "Reflecting on the fleeting nature of life, King Solomon urges us to engage fully with the present task. Don't live life halfway; whatever task is in front of you, give it your full passion and energy."
      },
      {
        id: 29,
        hebrew: "צֶ֥דֶק צֶ֖דֶק תִּרְדֹּ֑ף",
        translation: "Justice, justice shall you pursue.",
        source: "Deuteronomy 16:20",
        reflection: "The repetition of the word 'Justice' (Tzedek) teaches that the means used to get justice must also be just. We must not just wait for justice to happen; we must actively chase it with integrity."
      },
      {
        id: 30,
        hebrew: "עֵ֥ת לִבְכּ֖וֹת וְעֵ֣ת לִשְׂח֑וֹק",
        translation: "A time to weep and a time to laugh.",
        source: "Ecclesiastes 3:4",
        reflection: "King Solomon acknowledges that the human experience requires a full range of emotions. Life is a cycle; it is healthy to embrace sadness when it comes, just as it is vital to embrace joy. Wisdom is knowing which season you are in."
      },

      // --- Part IV: Hope & Faith (Bitachon) ---
      {
        id: 31,
        hebrew: "גַּם֩ כִּֽי־אֵלֵ֜ךְ בְּגֵ֣יא צַלְמָ֗וֶת לֹא־אִ֘ירָ֤א רָ֗ע כִּי־אַתָּ֥ה עִמָּדִ֑י",
        translation: "Though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.",
        source: "Psalm 23:4",
        reflection: "King David often wrote from caves while fleeing enemies, visualizing Hashem not as a distant observer, but as a companion in the dark. Even in your darkest moments, you are never truly alone."
      },
      {
        id: 32,
        hebrew: "פּוֹתֵ֥חַ אֶת־יָדֶ֑ךָ וּמַשְׂבִּ֖יעַ לְכָל־חַ֣י רָצֽוֹן",
        translation: "You open Your hand and satisfy the desire of every living thing.",
        source: "Psalm 145:16",
        reflection: "This verse is central to the 'Ashrei' prayer. It is an affirmation that Hashem is the ultimate Provider. We put in our effort (Hishtadlut), but we trust that the outcome and our sustenance ultimately come from the Creator's open hand."
      },
      {
        id: 33,
        hebrew: "וְקוֹיֵ֤ יְהוָה֙ יַחֲלִ֣יפוּ כֹ֔חַ",
        translation: "Those who hope in Hashem will renew their strength.",
        source: "Isaiah 40:31",
        reflection: "Isaiah compares those who trust in God to eagles who soar without growing weary. Hope (Tikvah) is a source of energy; when you are exhausted, connecting to the Eternal can recharge your spirit."
      },
      {
        id: 34,
        hebrew: "קָר֣וֹב יְ֭הוָה לְנִשְׁבְּרֵי־לֵ֑ב",
        translation: "Hashem is close to the brokenhearted.",
        source: "Psalm 34:19",
        reflection: "King David realized that while humans often avoid broken people, God cherishes them. Heartbreak does not mean you are abandoned; on the contrary, vulnerability creates a unique opening for spiritual closeness."
      },
      {
        id: 35,
        hebrew: "זֶה־הַ֭יּוֹם עָשָׂ֣ה יְהוָ֑ה נָגִ֖ילָה וְנִשְׂמְחָ֣ה בֽוֹ",
        translation: "This is the day Hashem has made; let us rejoice and be glad in it.",
        source: "Psalm 118:24",
        reflection: "This declaration from the Hallel prayer is made despite difficulties, thanking God for the gift of the present moment. Happiness is a choice we make in the present; don't wait for a special occasion, but find the joy in this specific day."
      },
      {
        id: 36,
        hebrew: "הִנֵּ֣ה לֹֽא־יָ֭נוּם וְלֹ֣א יִישָׁ֑ן שׁ֝וֹמֵ֗ר יִשְׂרָאֵֽל",
        translation: "Behold, the Guardian of Israel neither slumbers nor sleeps.",
        source: "Psalm 121:4",
        reflection: "Travelers reciting this Psalm knew that while they must sleep, the Guardian does not. There is a constant, watchful force of protection over us; you can rest, knowing that the Almighty is watching over the Jewish people."
      },
      {
        id: 37,
        hebrew: "אֲנִי לְדוֹדִי וְדוֹדִי לִי",
        translation: "I am my beloved's and my beloved is mine.",
        source: "Song of Songs 6:3",
        reflection: "King Solomon's Song of Songs is interpreted by the Sages as a metaphor for the love between Hashem and the Jewish people. This verse encapsulates the mutual, deep, and personal relationship every Jew has with the Creator."
      },
      {
        id: 38,
        hebrew: "קוּמִי אוֹרִי כִּי בָא אוֹרֵךְ",
        translation: "Arise, shine, for your light has come.",
        source: "Isaiah 60:1",
        reflection: "Isaiah addressed a Jerusalem in ruins, prophesying a time when it would be a beacon of light. Wake up to your potential; the light you have been waiting for is already within you, you just need to stand up and reflect it."
      },
      {
        id: 39,
        hebrew: "הַזֹּרְעִ֥ים בְּדִמְעָh בְּרִנָּ֥ה יִקְצֹֽרוּ",
        translation: "Those who sow in tears will reap in joy.",
        source: "Psalm 126:5",
        reflection: "This Psalm, sung before Birkat Hamazon, acknowledges that building is painful (tears) but promises a harvest of happiness. Pain is often the seed of future growth; the struggles you endure today are planting the fields for tomorrow's happiness."
      },
      {
        id: 40,
        hebrew: "בְּטַ֣ח אֶל־יְ֭הוָה בְּכָל־לִבֶּ֑ךָ",
        translation: "Trust in Hashem with all your heart.",
        source: "Proverbs 3:5",
        reflection: "King Solomon advises against relying solely on human intellect. Sometimes you have to let go of your need to control everything and simply trust (Bitachon) that you are being guided in the right direction."
      },

      // --- Part V: Wisdom & Learning ---
      {
        id: 41,
        hebrew: "רֵאשִׁית חָכְמָה יִרְאַת יְהוָה",
        translation: "The beginning of wisdom is awe of Hashem.",
        source: "Psalm 111:10",
        reflection: "The word 'Yirah' means both fear and awe. Wisdom isn't just data; it starts with the humility of realizing there is something vast and mysterious beyond us. True intelligence starts with the realization that the Creator is infinite."
      },
      {
        id: 42,
        hebrew: "אוֹ חַבְרוּתָא אוֹ מִיתוּתָא",
        translation: "Either friendship or death.",
        source: "Taanit 23a",
        reflection: "The Talmud tells the story of Choni HaMa'agel to illustrate that loneliness is a form of death. We are social beings who need connection to survive; learning and living are best done with a partner (chavruta) who challenges and supports us."
      },
      {
        id: 43,
        hebrew: "סְיָג לַחָכְמָה שְׁתִיקָה",
        translation: "A fence for wisdom is silence.",
        source: "Pirkei Avot 3:13",
        reflection: "Rabbi Akiva taught that just as a fence protects a garden, silence protects wisdom. Sometimes the smartest thing you can say is nothing at all; silence allows you to listen, observe, and learn before you speak."
      },
      {
        id: 44,
        hebrew: "דִּבְרֵ֣י חֲכָמִ֔ים בְּנַ֖חַת נִשְׁמָעִ֑ים",
        translation: "The words of the wise are heard when spoken softly.",
        source: "Ecclesiastes 9:17",
        reflection: "King Solomon observed that shouting indicates insecurity, while quiet confidence commands attention. You don't need to shout to be heard; truth has its own quiet power that penetrates the heart more effectively than noise."
      },
      {
        id: 45,
        hebrew: "לֹא הַבַּיְשָׁן לָמֵד, וְלֹא הַקַּפְּדָן מְלַמֵּד",
        translation: "The bashful cannot learn, and the impatient cannot teach.",
        source: "Pirkei Avot 2:5",
        reflection: "Hillel the Elder was known for his extreme patience. Growth requires vulnerability (to ask questions without shame) and patience (to explain answers without anger); both student and teacher must be open."
      },
      {
        id: 46,
        hebrew: "בַּרְזֶ֣ל בְּבַרְזֶ֣ל יָ֑חַד וְ֝אִ֗ישׁ יַ֣חַד פְּנֵֽי־רֵעֵֽהוּ",
        translation: "As iron sharpens iron, so one person sharpens another.",
        source: "Proverbs 27:17",
        reflection: "King Solomon noted that a knife cannot sharpen itself; it needs friction against another stone. We improve through healthy debate (Machloket); surround yourself with people who challenge you to be sharper and better."
      },
      {
        id: 47,
        hebrew: "חוֹתָמוֹ שֶׁל הַקָּדוֹשׁ בָּרוּךְ הוּא אֱמֶת",
        translation: "The seal of the Holy One, Blessed be He, is Truth.",
        source: "Shabbat 55a",
        reflection: "Rabbi Chanina taught that just as a seal authenticates a document, Truth (Emet) is the signature of God on reality. Living authentically and truthfully is the ultimate way to align yourself with the Divine."
      },
      {
        id: 48,
        hebrew: "טֽוֹבָה־חָכְמָ֥ה מִפְּנִינִ֑ים",
        translation: "Wisdom is better than pearls.",
        source: "Proverbs 8:11",
        reflection: "Though King Solomon possessed vast wealth, he consistently wrote that wisdom was the only asset with intrinsic, eternal value. Material possessions are temporary, but the Torah wisdom you acquire becomes part of your soul forever."
      },
      {
        id: 49,
        hebrew: "אַל תִּסְתַּכֵּל בְּקַנְקַן, אֶלָּא בְמַה שֶּׁיֵּשׁ בּוֹ",
        translation: "Do not look at the flask, but at what is inside.",
        source: "Pirkei Avot 4:20",
        reflection: "Rabbi Meir explained that a new flask can hold old, valuable wine, and an old flask can be empty. Don't judge people or situations by their external appearance; true value is found in the content of the character, not the packaging."
      },
      {
        id: 50,
        hebrew: "הֲשִׁיבֵ֨נוּ יְהוָ֤ה ׀ אֵלֶ֙יךָ֙ וְֽנָשׁ֔וּבָה",
        translation: "Turn us back to You, O Lord, and we shall return.",
        source: "Lamentations 5:21",
        reflection: "This is the penultimate verse of Lamentations, recited to end on a note of hope. It is never too late to fix a relationship or start over; the door to return (Teshuvah) is always open."
      },

      // --- Part VI: World & Society ---
      {
        id: 51,
        hebrew: "כָּל הַמְקַיֵּם נֶפֶשׁ אַחַת, כְּאִלּוּ קִיֵּם עוֹלָם מָלֵא",
        translation: "Whoever saves one life, it is as if he saved an entire world.",
        source: "Mishnah Sanhedrin 4:5",
        reflection: "The Mishnah teaches the infinite value of every individual. Never underestimate the impact of helping a single person; to that person, and to their future generations, your act is everything."
      },
      {
        id: 52,
        hebrew: "וְכִתְּת֨וּ חַרְבוֹתָ֜ם לְאִתִּ֗ים",
        translation: "They shall beat their swords into plowshares.",
        source: "Isaiah 2:4",
        reflection: "The Prophet Isaiah's messianic vision envisions a time when nations will no longer study war. The ultimate Jewish vision is a world where energy spent on conflict is transformed into energy for creation and growth."
      },
      {
        id: 53,
        hebrew: "עַל שְׁלֹשָׁה דְבָרִים הָעוֹלָם עוֹמֵד: עַל הַתּוֹרָה וְעַל הָעֲבוֹדָה וְעַל גְּמִילוּת חֲסָדִים",
        translation: "The world stands on three things: On Torah, on Service, and on Acts of Lovingkindness.",
        source: "Pirkei Avot 1:2",
        reflection: "Shimon HaTzaddik defined the spiritual ecosystem of the universe. A stable world requires a balance of wisdom (Torah), spirituality (Avodah/Prayer), and action (Gemilut Chasadim)."
      },
      {
        id: 54,
        hebrew: "וְיִגַּ֥ל כַּמַּ֖יִם מִשְׁפָּ֑ט",
        translation: "Let justice roll down like waters.",
        source: "Amos 5:24",
        reflection: "The Prophet Amos railed against the corruption of the wealthy elite. Justice shouldn't be a trickle; it should be a powerful, unstoppable force that cleanses and refreshes society."
      },
      {
        id: 55,
        hebrew: "וְאָהַבְתֶּ֖ם אֶת־הַגֵּ֑ר כִּי־גֵרִ֥ים הֱיִיתֶ֖ם",
        translation: "You shall love the stranger, for you were strangers.",
        source: "Deuteronomy 10:19",
        reflection: "The command to love the stranger appears 36 times in the Torah. Use your own history of suffering to build empathy for others; because we know what it feels like to be outsiders in Egypt, we must ensure no one else feels that way."
      },
      {
        id: 56,
        hebrew: "לֹא בְחַיִל וְלֹא בְכֹחַ כִּי אִם בְּרוּחִי",
        translation: "Not by might, nor by power, but by My Spirit.",
        source: "Zechariah 4:6",
        reflection: "Prophet Zechariah spoke these words regarding the Menorah, indicating that the Temple would be built not by armies, but by divine spirit. True victories are won not by physical domination, but by spiritual integrity."
      },
      {
        id: 57,
        hebrew: "עֹז־וְהָדָ֥ר לְבוּשָׁ֑הּ וַ֝תִּשְׂחַ֗ק לְי֣וֹם אַחֲרֽוֹן",
        translation: "Strength and dignity are her clothing, and she laughs at the future.",
        source: "Proverbs 31:25",
        reflection: "Describing the Woman of Valor (Eshet Chayil), this is also a lesson for the soul. When you clothe yourself in integrity and strength, you can face the unknown future with joy (Simcha) rather than fear."
      },
      {
        id: 58,
        hebrew: "לַכֹּ֖ל זְמָ֑ן וְעֵ֥ת לְכׇל־חֵ֖פֶץ",
        translation: "To everything there is a season, and a time to every purpose.",
        source: "Ecclesiastes 3:1",
        reflection: "King Solomon meditates on the temporary nature of all situations. Patience is key; trust the timing of your life, knowing that what is happening now is just one season in a larger journey."
      },
      {
        id: 59,
        hebrew: "עַל הַדִּין וְעַל הָאֱמֶת וְעַל הַשָּׁלוֹם",
        translation: "...on Justice, on Truth, and on Peace.",
        source: "Pirkei Avot 1:18",
        reflection: "Rabban Shimon ben Gamliel taught that society survives through Justice (Din), Truth (Emet), and Peace (Shalom). These are the three ingredients necessary for civilization; without truth, there is no justice, and without justice, there is no peace."
      },
      {
        id: 60,
        hebrew: "שְׁמַ֖ע יִשְׂרָאֵ֑ל יְהוָ֥ה אֱלֹהֵ֖ינוּ יְהוָ֥ה ׀ אֶחָֽד",
        translation: "Hear O Israel, Hashem is our God, Hashem is One.",
        source: "Deuteronomy 6:4",
        reflection: "The central declaration of Jewish faith. It is the ultimate affirmation: beneath the surface fragmentation of the world, there is a fundamental Unity connecting us all to the One Creator."
      },

      // --- Part VII: Expanded Jewish Inspiration ---
      {
        id: 61,
        hebrew: "אָכֵן יֵשׁ יְהוָה בַּמָּקוֹם הַזֶּה וְאָנֹכִי לֹא יָדָעְתִּי",
        translation: "Surely Hashem is in this place, and I did not know it.",
        source: "Genesis 28:16",
        reflection: "Jacob wakes from his dream and realizes God's presence is not limited to holy sites. Often, the Divine is right in front of us in our daily lives, but we are too distracted to notice the Kedusha (holiness) in the mundane."
      },
      {
        id: 62,
        hebrew: "יְהוָה יִלָּחֵם לָכֶם וְאַתֶּם תַּחֲרִשׁוּן",
        translation: "Hashem will fight for you, and you shall remain silent.",
        source: "Exodus 14:14",
        reflection: "Spoken by Moses at the Yam Suf (Red Sea) when the people were panicking. Sometimes the right action is not to panic or strategize, but to stand still and let faith carry you through the crisis."
      },
      {
        id: 63,
        hebrew: "מִצְוָה גְּדוֹלָה לִהְיוֹת בְּשִׂמְחָה תָּמִיד",
        translation: "It is a great Mitzvah to be happy always.",
        source: "Rebbe Nachman of Breslov",
        reflection: "Rebbe Nachman taught that joy is not just a feeling, but a religious obligation and a spiritual tool. Happiness opens the mind and heart, allowing us to connect to God and overcome challenges."
      },
      {
        id: 64,
        hebrew: "לֹא עַל־הַלֶּחֶם לְבַדּוֹ יִחְיֶה הָאָדָם",
        translation: "Man does not live by bread alone.",
        source: "Deuteronomy 8:3",
        reflection: "Physical sustenance is necessary for survival, but it is not enough for a life of meaning. The Jewish soul requires purpose, Torah wisdom, and spiritual connection to truly be 'alive'."
      },
      {
        id: 65,
        hebrew: "כִּי הָאָדָם יִרְאֶה לַעֵינַיִם וַיהוָה יִרְאֶה לַלֵּב",
        translation: "For man looks at the outward appearance, but Hashem looks at the heart.",
        source: "1 Samuel 16:7",
        reflection: "When Prophet Samuel went to anoint a new king, he was impressed by physical stature. God corrected him, teaching that external looks are deceiving; true leadership and worth come from internal character and Yirat Shamayim (Fear of Heaven)."
      },
      {
        id: 66,
        hebrew: "קוֹל דְּמָמָה דַקָּה",
        translation: "A still small voice.",
        source: "1 Kings 19:12",
        reflection: "Elijah the Prophet sought God in the wind, earthquake, and fire, but God was in none of them. The Divine presence is often found not in the loud and spectacular, but in silence and subtlety."
      },
      {
        id: 67,
        hebrew: "כִּי־תַעֲבֹר בַּמַּיִם אִתְּךָ־אָנִי",
        translation: "When you pass through the waters, I will be with you.",
        source: "Isaiah 43:2",
        reflection: "Life will inevitably involve passing through 'waters'—overwhelming emotions or situations. The promise isn't that you won't get wet, but that you won't drown because you are supported by the Rock of Israel."
      },
      {
        id: 68,
        hebrew: "כִּי־הֶהָרִים יָמוּשׁוּ... וְחַסְדִּי מֵאִתֵּךְ לֹא־יָמוּשׁ",
        translation: "For the mountains may move... but My kindness shall not move from you.",
        source: "Isaiah 54:10",
        reflection: "Nature itself may change, but God's covenant of love is more permanent than the physical world. This offers profound stability in an ever-changing world."
      },
      {
        id: 69,
        hebrew: "גַּם זוּ לְטוֹבָה",
        translation: "This too is for the good.",
        source: "Nachum Ish Gamzu (Talmud Taanit 21a)",
        reflection: "The sage Nachum would react to every misfortune with this phrase. It is the ultimate expression of faith that everything Hashem does—even if it appears painful in the moment—is ultimately for our benefit."
      },
      {
        id: 70,
        hebrew: "כִּי חֶסֶד חָפַצְתִּי וְלֹא־זָבַח",
        translation: "For I desire kindness, and not sacrifice.",
        source: "Hosea 6:6",
        reflection: "Religious ritual without ethical behavior is empty. The Prophet Hosea teaches that Hashem prefers a heart full of Chessed (kindness) towards others over technical observance of rituals performed without love."
      },
      {
        id: 71,
        hebrew: "אַל־תִּשְׂמְחִי אֹיַבְתִּי לִי כִּי נָפַלְתִּי קָמְתִּי",
        translation: "Do not rejoice over me, my enemy; though I have fallen, I will rise.",
        source: "Micah 7:8",
        reflection: "Resilience is the Jewish answer to adversity. By framing a fall as merely a prelude to rising (Yeridah l'tzorech Aliyah), you take away the power of any enemy or obstacle to defeat you."
      },
      {
        id: 72,
        hebrew: "אֱמֶת וּמִשְׁפַּט שָׁלוֹם שִׁפְטוּ בְּשַׁעֲרֵיכֶם",
        translation: "Execute the judgment of truth and peace in your gates.",
        source: "Zechariah 8:16",
        reflection: "Truth and peace are often seen as opposites, but the prophet urges us to find the 'judgment' that fuses them. We must strive for a society where integrity leads to harmony."
      },
      {
        id: 73,
        hebrew: "הַשָּׁמַיִם מְסַפְּרִים כְּבוֹד־אֵל",
        translation: "The heavens declare the glory of God.",
        source: "Psalm 19:1",
        reflection: "Nature is a window into the Divine. Looking at the vastness of the sky or the complexity of the universe can instill a sense of awe and spiritual perspective on the Creator's mastery."
      },
      {
        id: 74,
        hebrew: "יְהוָה אוֹרִי וְיִשְׁעִי מִמִּי אִירָא",
        translation: "Hashem is my light and my salvation; whom shall I fear?",
        source: "Psalm 27:1",
        reflection: "Recited during the High Holiday season (Elul), this Psalm reminds us that fear is often a result of feeling alone in the dark. When you perceive the Almighty as your personal 'light,' fear dissipates because you can see your path clearly."
      },
      {
        id: 75,
        hebrew: "לֵב טָהוֹר בְּרָא־לִי אֱלֹהִים",
        translation: "Create in me a pure heart, O God.",
        source: "Psalm 51:12",
        reflection: "King David, after his moral failure, does not ask for riches or victory, but for a spiritual reset. We always have the ability to do Teshuvah and ask for a fresh start and a cleansed conscience."
      },
      {
        id: 76,
        hebrew: "לִמְנוֹת יָמֵינוּ כֵּן הוֹדַע",
        translation: "Teach us to number our days.",
        source: "Psalm 90:12",
        reflection: "Awareness of mortality is not meant to be morbid, but motivating. Realizing our time is limited forces us to prioritize what truly matters—Torah, family, and good deeds—and not waste days on trivialities."
      },
      {
        id: 77,
        hebrew: "כָּל הָעוֹלָם כֻּלּוֹ גֶּשֶׁר צַר מְאֹד",
        translation: "The whole world is a very narrow bridge.",
        source: "Rebbe Nachman of Breslov",
        reflection: "Rebbe Nachman's famous teaching continues: '...and the main thing is not to be afraid at all.' Life is full of danger and instability, but the key to crossing the bridge is to maintain your courage and focus."
      },
      {
        id: 78,
        hebrew: "שִׂנְאָה תְּעוֹרֵר מְדָנִים וְעַל כָּל־פְּשָׁעִים תְּכַסֶּה אַהֲבָה",
        translation: "Hatred stirs up strife, but love covers all offenses.",
        source: "Proverbs 10:12",
        reflection: "Focusing on hatred (Sinat Chinam) only fuels conflict. Love (Ahavat Chinam) doesn't necessarily ignore problems, but it provides a covering—a context of safety—within which problems can be solved without destroying relationships."
      },
      {
        id: 79,
        hebrew: "מַעֲנֶה־רַּךְ יָשִׁיב חֵמָה",
        translation: "A soft answer turns away wrath.",
        source: "Proverbs 15:1",
        reflection: "When faced with anger, the natural instinct is to fight back. Wisdom is knowing that lowering your volume and softening your tone is actually the most powerful weapon to diffuse a fight."
      },
      {
        id: 80,
        hebrew: "חֲנֹךְ לַנַּעַר עַל־פִּי דַרְכּוֹ",
        translation: "Train a child according to his way.",
        source: "Proverbs 22:6",
        reflection: "Education (Chinuch) is not one-size-fits-all. To truly teach someone, you must understand their unique nature ('his way') and tailor your guidance to their specific strengths and weaknesses."
      },
      {
        id: 81,
        hebrew: "טוֹב שֵׁם מִשֶּׁמֶן טוֹב",
        translation: "A good name is better than fine oil.",
        source: "Ecclesiastes 7:1",
        reflection: "Fine oil was a luxury item of the ancient world. King Solomon teaches that your reputation (Shem Tov)—the integrity associated with your name—is more valuable than any status symbol."
      },
      {
        id: 82,
        hebrew: "אַל תִּפְרוֹשׁ מִן הַצִּבּוּר",
        translation: "Do not separate yourself from the community.",
        source: "Pirkei Avot 2:5",
        reflection: "Hillel warns against isolation. Even if the community is flawed, remaining connected ensures you stay grounded, supported, and able to contribute to the Klal (the collective)."
      },
      {
        id: 83,
        hebrew: "הֱוֵי עַז כַּנָּמֵר",
        translation: "Be bold as a leopard.",
        source: "Pirkei Avot 5:20",
        reflection: "Religious living requires boldness. You shouldn't be embarrassed to do the right thing, even if it is unpopular. Have the 'audacity' of a leopard when it comes to doing the will of your Father in Heaven."
      },
      {
        id: 84,
        hebrew: "מִצְוָה גּוֹרֶרֶת מִצְוָה",
        translation: "One Mitzvah leads to another Mitzvah.",
        source: "Pirkei Avot 4:2",
        reflection: "Don't worry about doing something huge; just do one small good thing. The spiritual momentum of that single act will naturally propel you toward the next one, creating a positive chain reaction."
      },
      {
        id: 85,
        hebrew: "דַּע מֵאַיִן בָּאתָ וּלְאָן אַתָּה הוֹלֵךְ",
        translation: "Know from where you came and to where you are going.",
        source: "Pirkei Avot 3:1",
        reflection: "Akavya ben Mahalalel gives the formula for humility and purpose. Remembering your origin (dust) keeps you humble; remembering your ultimate destination (standing before the King of Kings) keeps you focused on what truly matters."
      },
      {
        id: 86,
        hebrew: "צַדִּיק בֶּאֱמוּנָתוֹ יִחְיֶה",
        translation: "The righteous shall live by his faith.",
        source: "Habakkuk 2:4",
        reflection: "The Talmud suggests that all 613 commandments can be distilled into this one principle. A life of meaning is sustained by Emunah (faith)—the steadfast belief that life has purpose and God is involved in our destiny."
      },
      {
        id: 87,
        hebrew: "יְהִי כְבוֹד חֲבֵרְךָ חָבִיב עָלֶיךָ כְּשֶׁלָּךְ",
        translation: "Let the honor of your fellow be as dear to you as your own.",
        source: "Pirkei Avot 2:10",
        reflection: "Rabbi Eliezer teaches that empathy must extend to dignity. We guard our own reputation and feelings fiercely; we must be just as vigilant in protecting the dignity of others."
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
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-7-4-7 4V4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
        `;

        const mainRow = container.querySelector('.daily-inspiration-main');
        if (mainRow) {
            const actions = document.createElement('div');
            actions.className = 'daily-inspiration-actions';
            actions.appendChild(btn);
            mainRow.appendChild(actions);
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
