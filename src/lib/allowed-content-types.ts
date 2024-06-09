export const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function getMimeTypesAsExtensions(mimeTypes: string[]) {
  const extensions = mimeTypes.map((mimeType) => {
    const [type, subtype] = mimeType.split("/");
    return `.${subtype}`;
  });

  return extensions.join(",");
}

