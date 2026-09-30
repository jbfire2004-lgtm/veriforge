/**
 * Vera Core component library — usage examples for documentation and Storybook-style reference.
 * Import components from `@/components/vera-core`.
 */

export const VERA_CORE_COMPONENT_CATALOG = {
  navigation: {
    VeraSidebar: `<VeraSidebar open={open} onOpenChange={setOpen} />`,
    SidebarItem: `<SidebarItem href="/admin/workers" icon={Users} label="Workers" active />`,
    MobileSidebarDrawer: `<MobileSidebarDrawer open={open} onClose={() => setOpen(false)}>{nav}</MobileSidebarDrawer>`,
    VeraBreadcrumbs: `<VeraBreadcrumbs items={[{ label: "Workers", href: "/admin/workers" }, { label: "Jane Doe" }]} />`,
  },
  dashboard: {
    DashboardGrid: `<DashboardGrid><DashboardCard title="Workers" value={128} /></DashboardGrid>`,
    ComplianceWidget: `<ComplianceWidget title="Compliance" progress={72} breakdown={[{ label: "Compliant", value: 90 }]} />`,
    QuickActionButton: `<QuickActionButton href="/admin/workers/new" icon={UserPlus} label="Add worker" />`,
  },
  data: {
    DataTable: `<DataTable columns={cols} rows={rows} sortKey={sort} onSort={setSort} page={1} pageSize={25} />`,
    StatusBadge: `<StatusBadge status="compliant" size="sm" />`,
    ActionMenu: `<ActionMenu items={[{ label: "Edit", onSelect: onEdit }]} />`,
  },
  forms: {
    FormContainer: `<FormContainer title="New worker" description="Required fields"><FormSection title="Identity">…</FormSection></FormContainer>`,
    TextInput: `<TextInput label="Legal name" value={name} onChange={setName} error={errors.name} />`,
    MultiStepForm: `<MultiStepForm steps={steps} currentStep={0} onNext={next} onSubmit={submit}>…</MultiStepForm>`,
  },
  modals: {
    VeraModal: `<VeraModal open={open} onClose={close} title="Confirm" footer={<Button>Save</Button>}>…</VeraModal>`,
    ConfirmationDialog: `<ConfirmationDialog open={open} variant="danger" onConfirm={onDelete} />`,
    toast: `const { toast } = useToast(); toast({ title: "Saved", variant: "success" });`,
  },
  profile: {
    ProfileHeader: `<ProfileHeader title="Jane Doe" subtitle="Ironworker" status={<StatusBadge status="compliant" />} actions={…} />`,
    Timeline: `<Timeline events={[{ id: "1", title: "Cert added", timestamp: "May 1" }]} />`,
  },
  list: {
    ListHeader: `<ListHeader title="Workers" search={<SearchBar onDebouncedChange={setQ} />} filters={<Filters chips={chips} />} />`,
    SearchBar: `<SearchBar placeholder="Search workers…" debounceMs={300} onDebouncedChange={setQuery} />`,
  },
  qr: {
    QRCodeDisplay: `<QRCodeDisplay src={qrDataUrl} title="Worker wallet" />`,
    ScanResultCard: `<ScanResultCard title="Jane Doe" actions={[{ label: "View profile", href: "/admin/workers/1" }]} />`,
  },
  utility: {
    EmptyState: `<EmptyState title="No workers" description="Add your first worker." action={…} />`,
    LoadingSpinner: `<LoadingSpinner label="Loading workers…" />`,
  },
} as const;
