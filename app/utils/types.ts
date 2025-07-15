export type User = {
  username: string;
  name: string;
  emailOrPhone: string;
  password: string;
  profileImage?: string;
};

export type UserAuth = {
  username: string;
  name: string;
  profileImage?: string;
};