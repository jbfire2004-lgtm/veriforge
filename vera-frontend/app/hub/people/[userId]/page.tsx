import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ userId: string }> | { userId: string };
};

export default async function HubPeopleRedirect({ params }: Props) {
  const { userId } = await Promise.resolve(params);
  redirect(`/hub/profile/${userId}`);
}
