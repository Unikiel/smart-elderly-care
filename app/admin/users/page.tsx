import { createStaffUser } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getCopy } from "@/lib/locale-server";
import { getStore } from "@/lib/store";

export default async function UsersPage() {
  const { t } = await getCopy();
  const me = await getSessionUser();
  const users = getStore().users;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">{t.adminPeopleTitle}</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="rounded-[22px] bg-white px-5 py-4">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted">
              {user.email} · {user.role === "admin" ? t.adminRoleAdmin : t.adminRoleStaff}
            </p>
          </li>
        ))}
      </ul>
      {me?.role === "admin" ? (
        <form
          action={async (formData) => {
            await createStaffUser(formData);
          }}
          className="space-y-3 rounded-[22px] bg-white p-5"
        >
          <h2 className="font-bold">{t.adminAddStaff}</h2>
          <input name="name" placeholder={t.adminName} className="w-full rounded-full bg-canvas px-4 py-2" />
          <input name="email" placeholder={t.loginAccount} className="w-full rounded-full bg-canvas px-4 py-2" />
          <input
            name="password"
            type="password"
            placeholder={t.adminPasswordPh}
            className="w-full rounded-full bg-canvas px-4 py-2"
          />
          <button className="rounded-full bg-ink px-4 py-2 text-white">{t.adminAdd}</button>
        </form>
      ) : null}
    </div>
  );
}
