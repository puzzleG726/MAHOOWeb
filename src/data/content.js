export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^public\//, "")}`;

export const translations = {
  en: {
    aboutCopy:
      "We build immersive and interactive experiences for brands, exhibitions, and public-facing spaces.",
    serviceH5: "H5 Interaction",
    serviceCreativeTech: "Creative Technology",
    serviceExhibition: "Exhibition Installations",
    serviceBrand: "Brand Activations",
    contactJoin: "Join Us",
    contactBusiness: "Business Cooperation",
    contactMore: "For More Info",
    contactXiaohongshu: "RedNote",
    contactWechat: "Wechat Official Account",
    contactAddress: "Address",
    contactAddressValue:
      "Shanghai, YangPu District, 88Zhengxue rd. Building 5, 1005",
  },
  ch: {
    aboutCopy:
      "MAHOO LAB是一个学科多元化的创意团队，打破科技与艺术、科技与人文的边界，用“交互”的视角看待新媒体艺术，并将其应用于品牌跨界等创作。",
    serviceH5: "H5交互",
    serviceCreativeTech: "创意技术",
    serviceExhibition: "展览全案",
    serviceBrand: "品牌营销",
    contactJoin: "加入我们",
    contactBusiness: "商业合作",
    contactMore: "更多信息",
    contactXiaohongshu: "小红书",
    contactWechat: "微信公众号",
    contactAddress: "地址",
    contactAddressValue: "上海市杨浦区政学路88号5号楼1005室",
  },
};

export const serviceCards = [
  {
    key: "exhibition",
    icon: asset("ServiceLogo/icon2.png"),
    labelKey: "serviceCreativeTech",
  },
  {
    key: "realtime",
    icon: asset("ServiceLogo/icon3.png"),
    labelKey: "serviceExhibition",
  },
  {
    key: "creative",
    icon: asset("ServiceLogo/icon4.png"),
    labelKey: "serviceBrand",
  },
  {
    key: "brand",
    icon: asset("ServiceLogo/icon1.png"),
    labelKey: "serviceH5",
  },
];

export const servicesData = {
  brand: {
    title: {
      en: "H5 Interaction",
      ch: "H5交互",
    },
    description: {
      en: "H5 systems for online campaigns, including campaign planning, user data capture, and interaction logic optimized for engagement and conversion.",
      ch: "面向线上活动的 H5 系统开发，涵盖活动策划、用户数据采集及针对传播与转化优化的交互逻辑设计。",
    },
    gallery: [
      {
        imageUrl: asset("sample/item_h5/25.jpg"),
        tags: {
          en: ["H5", "Campaign", "Data Capture"],
          ch: ["H5", "活动", "数据采集"],
        },
      },
      {
        imageUrl: asset("sample/item_h5/28.jpg"),
        tags: {
          en: ["2025AWE", "Changhong", "Electronic Seal", "Check-in"],
          ch: ["2025AWE", "长虹", "电子印章", "打卡"],
        },
      },
      {
        imageUrl: asset("sample/item_h5/29.jpg"),
        tags: {
          en: ["SK-II", "Interaction", "AR", "Skincare"],
          ch: ["SK-II", "互动", "AR", "护肤"],
        },
      },
    ],
  },
  exhibition: {
    title: {
      en: "Creative Technology",
      ch: "创意技术",
    },
    description: {
      en: "Interactive content, digital scenography, control systems, multisensory presentation.",
      ch: "根据不同场景定制 interactive visuals、响应式系统与装置，实现技术与创意的结合落地。",
    },
    gallery: [
      {
        imageUrl: asset("sample/item_dev/9.jpg"),
        tags: {
          en: ["Guinness", "Photo", "Video", "Check-in"],
          ch: ["健力士", "拍照", "视频", "签到"],
        },
      },
      {
        imageUrl: asset("sample/item_dev/24.jpg"),
        tags: {
          en: ["BASF", "Game Interaction"],
          ch: ["巴斯夫", "游戏互动"],
        },
      },
      {
        imageUrl: asset("sample/item_dev/37.jpg"),
        tags: {
          en: ["Unilever", "Annual Meeting", "Lucky Draw", "Game"],
          ch: ["联合利华", "年会", "抽奖", "游戏"],
        },
      },
    ],
  },
  realtime: {
    title: {
      en: "Exhibition Installations",
      ch: "展览全案",
    },
    description: {
      en: "End-to-end exhibition delivery covering interaction design, spatial storytelling, technical execution, and on-site deployment.",
      ch: "从交互设计、空间叙事到技术实现与施工部署的一体化展览全案交付。",
    },
    gallery: [
      {
        imageUrl: asset("sample/item_ex/7.jpg"),
        tags: {
          en: ["CIMC", "Exhibition Hall"],
          ch: ["CIMC", "展厅"],
        },
      },
      {
        imageUrl: asset("sample/item_ex/8.jpg"),
        tags: {
          en: ["Landmark Building"],
          ch: ["地标建筑"],
        },
      },
      {
        imageUrl: asset("sample/item_ex/10.jpg"),
        tags: {
          en: ["XPeng Motors", "AI"],
          ch: ["小鹏汽车", "AI"],
        },
      },
    ],
  },
  creative: {
    title: {
      en: "Brand Activations",
      ch: "品牌营销",
    },
    description: {
      en: "Strategic brand activations integrating campaign planning, creative technology, and media systems to enhance impact and engagement.",
      ch: "整合品牌活动策划、创意技术与影像系统的战略性应用，提升传播与体验效果。",
    },
    gallery: [
      {
        imageUrl: asset("sample/item_brand/1.png"),
        tags: {
          en: ["Friso", "Live Streaming"],
          ch: ["美素佳儿", "直播"],
        },
      },
      {
        imageUrl: asset("sample/item_brand/3.png"),
        tags: {
          en: ["Admiral", "Racing"],
          ch: ["爱德王子", "赛车"],
        },
      },
      {
        imageUrl: asset("sample/item_brand/4.png"),
        tags: {
          en: ["Shell", "Oil", "Live Streaming"],
          ch: ["壳牌", "机油", "直播"],
        },
      },
    ],
  },
};

export const sampleImages = Array.from({ length: 16 }, (_, index) => {
  const ext = index < 7 ? "png" : "jpg";
  return asset(`sample/sample${index + 1}.${ext}`);
});

export const brandLogos = Array.from({ length: 40 }, (_, index) => {
  const file = String(index + 1).padStart(3, "0");
  return {
    src: asset(`logo_partner/${file}.png`),
    alt: `Brand logo ${file}`,
  };
});
