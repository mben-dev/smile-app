import { cookies } from "next/headers";
// import Image, { type ImageProps } from "next/image";
import { redirect } from "next/navigation";

// type Props = Omit<ImageProps, "src"> & {
//   srcLight: string;
//   srcDark: string;
// };

// const ThemeImage = (props: Props) => {
//   const { srcLight, srcDark, ...rest } = props;

//   return (
//     <>
//       <Image {...rest} src={srcLight} className="imgLight" />
//       <Image {...rest} src={srcDark} className="imgDark" />
//     </>
//   );
// };

export default async function Home() {
  // Check if the user is authenticated
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("auth_token")?.value;

  // Redirect to dashboard if authenticated, otherwise to login
  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }

  // This will never be rendered due to the redirects
  return null;
}
