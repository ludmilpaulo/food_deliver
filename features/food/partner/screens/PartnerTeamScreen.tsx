'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { foodErrorMessage } from '../../api/foodApi';
import { FoodEmpty, FoodError, FoodSkeletonGrid } from '../../components/FoodStates';
import { Panel } from '../../components/WorkspaceShell';
import { useAddTeamMemberMutation, useGetTeamQuery, useRemoveTeamMemberMutation, useUpdateTeamMemberMutation } from '../partnerApi';
import type { TeamRole } from '../types';

export const TEAM_ROLES: Array<[TeamRole, string, string, string, string]> = [
  ['store_admin', 'fpRole_store_admin', 'Store administrator', 'fpRoleHint_store_admin', 'Everything, including team and payouts'],
  ['manager', 'fpRole_manager', 'Restaurant manager', 'fpRoleHint_manager', 'Orders, menu, hours and reports'],
  ['kitchen', 'fpRole_kitchen', 'Kitchen staff', 'fpRoleHint_kitchen', 'Sees orders, starts preparing and marks ready'],
  ['order_processing', 'fpRole_order_processing', 'Order processing', 'fpRoleHint_order_processing', 'Accepts/rejects orders and hands them over'],
  ['finance', 'fpRole_finance', 'Finance / reporting', 'fpRoleHint_finance', 'Reports, earnings and payouts only'],
];

export default function PartnerTeamScreen() {
  const { t } = useTranslation();
  const team = useGetTeamQuery();
  const [add, { isLoading }] = useAddTeamMemberMutation();
  const [update] = useUpdateTeamMemberMutation();
  const [remove] = useRemoveTeamMemberMutation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('kitchen');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await add({ email: email.trim(), role }).unwrap();
      setEmail('');
    } catch (err) {
      setError(foodErrorMessage(err, t('fpTeamAddFailed', 'Could not add this person.')));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">{t('fpTeam', 'Team')}</h1>
      <Panel title={t('fpAddMember', 'Add a team member')}>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2 text-sm">
          <label className="min-w-0 flex-1 space-y-1">
            <span>{t('fpMemberEmail', 'Email of their Kudya account')}</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="space-y-1">
            <span>{t('fpMemberRole', 'Role')}</span>
            <select value={role} onChange={(event) => setRole(event.target.value as TeamRole)} className="rounded-xl border border-slate-200 px-3 py-2">
              {TEAM_ROLES.map(([value, key, fallback]) => (
                <option key={value} value={value}>
                  {t(key, fallback)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={isLoading} className="rounded-full bg-kudya px-5 py-2 font-semibold text-white disabled:opacity-50">
            {t('fpAdd', 'Add')}
          </button>
        </form>
        <ul className="grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
          {TEAM_ROLES.map(([value, key, fallback, hintKey, hint]) => (
            <li key={value}>
              <b className="text-slate-700">{t(key, fallback)}:</b> {t(hintKey, hint)}
            </li>
          ))}
        </ul>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </Panel>
      <Panel title={t('fpMembers', 'Members')}>
        {team.isLoading ? (
          <FoodSkeletonGrid count={2} variant="row" />
        ) : team.isError ? (
          <FoodError onRetry={team.refetch} />
        ) : !team.data?.length ? (
          <FoodEmpty title={t('fpNoMembers', 'Only you have access so far')} />
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {team.data.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <select
                  value={member.role}
                  onChange={(event) => void update({ id: member.id, role: event.target.value as TeamRole })}
                  className="rounded-lg border border-slate-200 px-2 py-1"
                  aria-label={t('fpMemberRole', 'Role')}
                >
                  {TEAM_ROLES.map(([value, key, fallback]) => (
                    <option key={value} value={value}>
                      {t(key, fallback)}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={member.is_active} onChange={() => void update({ id: member.id, is_active: !member.is_active })} />
                  {t('fpActive', 'Active')}
                </label>
                <button
                  type="button"
                  onClick={() => window.confirm(t('fpRemoveMemberConfirm', 'Remove this person from your restaurant?')) && void remove(member.id)}
                  className="text-xs font-semibold text-red-600"
                >
                  {t('fpRemove', 'Remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
