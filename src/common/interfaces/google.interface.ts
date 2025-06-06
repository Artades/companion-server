export interface GoogleProfile {
  id: string;
  provider: string;
  emails: { value: string; verified?: boolean }[];
  name: {
    familyName: string;
    givenName: string;
  };
  photos: { value: string }[];
}

export interface GoogleUser {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  picture: string;
}
