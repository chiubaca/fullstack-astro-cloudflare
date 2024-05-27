import { actions } from "astro:actions";

import { useState } from "react";

export const FileUpload = () => {
  const [pendingUploadedFile, setPendingUploadedFile] = useState<File | null>();

  return (
    <form
      // onChange={(e: React.FormEvent<HTMLFormElement>) => {
      //   e.preventDefault();
      //   const files = (e.target as HTMLInputElement).files;

      //   if (files && files.length > 0) {
      //     console.log("🚀 ~ file: ~ files:", files[0]);

      //     setPendingUploadedFile(files[0]);
      //   }

      //   return;
      // }}
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        actions.fileUpload(formData);
      }}
    >
      <input type="file" id="file-upload" name="imageFile" accept="image/*" />
      <input type="submit" />
    </form>
  );
};
