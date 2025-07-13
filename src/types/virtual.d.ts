declare module "virtual:starlight-authors" {
  export const authors: Record<
    string,
    import("../plugins/config/authorsConfig").BlogAuthor
  >;
}
