export const makeImageUrl = (imageRef: string, transformParams?: string) => {
  const { PUBLIC_TRANSFORM_URL, PUBLIC_BUCKET_URL } = import.meta.env;

  if (!PUBLIC_TRANSFORM_URL) {
    throw new Error("You have not configured the image transform url");
  }

  if (!PUBLIC_BUCKET_URL) {
    throw new Error("You have not configured your public bucket access");
  }

  return `${PUBLIC_TRANSFORM_URL}/${
    transformParams ? transformParams : "f=auto"
  }/${PUBLIC_BUCKET_URL}/${imageRef}`;
};
