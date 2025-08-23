export enum OrganizationType {
  CLUB = "CLUB",
  EMPRESA = "EMPRESA",
  MUNICIPALIDAD = "MUNICIPALIDAD",
  PARTICULAR = "PARTICULAR",
  OTRO = "OTRO",
}

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  type: OrganizationType;
  logo: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
