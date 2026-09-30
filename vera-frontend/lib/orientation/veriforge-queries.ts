"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./veriforge-api";
import type { OrientationDefinitionType } from "./veriforge-types";

export const vfOrientationKeys = {
  all: ["vf-orientation"] as const,
  definitions: (companyId: number, projectId?: number) =>
    [...vfOrientationKeys.all, "definitions", companyId, projectId ?? null] as const,
  definition: (id: string) =>
    [...vfOrientationKeys.all, "definition", id] as const,
  requirements: (companyId: number, projectId?: number) =>
    [...vfOrientationKeys.all, "requirements", companyId, projectId ?? null] as const,
  profile: (workerId: number, companyId?: number) =>
    [...vfOrientationKeys.all, "profile", workerId, companyId ?? null] as const,
  links: (workerId: number) =>
    [...vfOrientationKeys.all, "links", workerId] as const,
};

export function useOrientationDefinitions(
  companyId: number | undefined,
  opts?: { projectId?: number; type?: OrientationDefinitionType; isPublished?: boolean },
) {
  return useQuery({
    queryKey: vfOrientationKeys.definitions(companyId ?? 0, opts?.projectId),
    queryFn: () =>
      api.listOrientationDefinitions({
        companyId: companyId!,
        projectId: opts?.projectId,
        type: opts?.type,
        isPublished: opts?.isPublished,
      }),
    enabled: companyId != null && companyId > 0,
  });
}

export function useOrientationDefinition(id: string | undefined) {
  return useQuery({
    queryKey: vfOrientationKeys.definition(id ?? ""),
    queryFn: () => api.getOrientationDefinition(id!),
    enabled: !!id,
  });
}

export function useOrientationRequirements(
  companyId: number | undefined,
  opts?: { projectId?: number; workerId?: number },
) {
  return useQuery({
    queryKey: vfOrientationKeys.requirements(companyId ?? 0, opts?.projectId),
    queryFn: () =>
      api.listOrientationRequirements({
        companyId: companyId!,
        projectId: opts?.projectId,
        workerId: opts?.workerId,
      }),
    enabled: companyId != null && companyId > 0,
  });
}

export function useWorkerOrientationProfile(
  workerId: number | undefined,
  opts?: { companyId?: number; projectId?: number },
) {
  return useQuery({
    queryKey: vfOrientationKeys.profile(workerId ?? 0, opts?.companyId),
    queryFn: () =>
      api.getWorkerOrientationProfile(workerId!, {
        companyId: opts?.companyId,
        projectId: opts?.projectId,
      }),
    enabled: workerId != null && workerId > 0,
  });
}

export function useOrientationDeliveryLinks(workerId: number | undefined) {
  return useQuery({
    queryKey: vfOrientationKeys.links(workerId ?? 0),
    queryFn: () => api.listOrientationDeliveryLinks(workerId!),
    enabled: workerId != null && workerId > 0,
  });
}

export function useCreateOrientationDefinition(companyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrientationDefinition,
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.definitions(companyId),
      });
    },
  });
}

export function useUpdateOrientationDefinition(companyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & Parameters<typeof api.updateOrientationDefinition>[1]) =>
      api.updateOrientationDefinition(id, body),
    onSuccess: (row) => {
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.definitions(companyId),
      });
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.definition(row.id),
      });
    },
  });
}

export function useCreateOrientationRequirement(companyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrientationRequirement,
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.requirements(companyId),
      });
    },
  });
}

export function useCreateOrientationCompletion(workerId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOrientationCompletion,
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.profile(workerId),
      });
    },
  });
}

export function useAssignOrientationDelivery(workerId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.assignOrientationDelivery,
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: vfOrientationKeys.links(workerId),
      });
    },
  });
}
