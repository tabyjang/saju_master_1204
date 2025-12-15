export interface TermDescription {
  title: string;
  description: string;
  keywords: string[];
}

export interface UnseongDescription extends TermDescription {
  hanja?: string;
  ilji?: {
    title: string;
    description: string;
  };
  wolji?: {
    title: string;
    description: string;
  };
}

export interface IljuGeneral {
  nature: string;
  characteristic: string;
  spouse: string;
  jobWealth: string;
  advice: string;
}

export interface IljuBundle {
  ganji: string; // 예: 甲子
  name: string; // 예: 갑자일주
  general: IljuGeneral;
  ilji: {
    sibsin: {
      name: string; // 예: 정인
      special_analysis?: {
        title: string;
        description: string;
      };
    } & Partial<TermDescription>;
    unseong: {
      name: string; // 예: 목욕
    } & UnseongDescription;
  };
}


