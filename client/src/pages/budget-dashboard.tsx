import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet, Plus, Minus, PieChart, Edit, Trash2, Briefcase, Home, Car, Zap, Tv, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Income, type Deduction, insertIncomeSchema, insertDeductionSchema } from "@shared/schema";

const incomeFormSchema = insertIncomeSchema.extend({
  amount: z.string().min(1, "Le montant est requis").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Le montant doit être un nombre positif"
  ),
});

const deductionFormSchema = insertDeductionSchema.extend({
  amount: z.string().min(1, "Le montant est requis").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Le montant doit être un nombre positif"
  ),
  deductionDate: z.string().min(1, "La date est requise").refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 31;
    },
    "La date doit être entre 1 et 31"
  ),
});

type IncomeFormData = z.infer<typeof incomeFormSchema>;
type DeductionFormData = z.infer<typeof deductionFormSchema>;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "housing": return Home;
    case "transport": return Car;
    case "utilities": return Zap;
    case "subscription": return Tv;
    default: return Minus;
  }
};

const getIncomeIcon = (description: string) => {
  if (description.toLowerCase().includes("salaire")) return Briefcase;
  if (description.toLowerCase().includes("freelance") || description.toLowerCase().includes("web")) return Laptop;
  return Plus;
};

export default function BudgetDashboard() {
  const { toast } = useToast();
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);

  // Queries
  const { data: incomes = [], isLoading: incomesLoading } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  const { data: deductions = [], isLoading: deductionsLoading } = useQuery<Deduction[]>({
    queryKey: ["/api/deductions"],
  });

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalDeductions = deductions.reduce((sum, deduction) => sum + Number(deduction.amount), 0);
  const remainingBudget = totalIncome - totalDeductions;

  // Income form
  const incomeForm = useForm<IncomeFormData>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      frequency: "monthly",
    },
  });

  // Deduction form
  const deductionForm = useForm<DeductionFormData>({
    resolver: zodResolver(deductionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "housing",
      deductionDate: "",
    },
  });

  // Mutations
  const createIncomeMutation = useMutation({
    mutationFn: async (data: IncomeFormData) => {
      const payload = { ...data, amount: data.amount };
      return apiRequest("POST", "/api/incomes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      incomeForm.reset();
      toast({ title: "Revenu ajouté avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'ajout du revenu", variant: "destructive" });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IncomeFormData }) => {
      const payload = { ...data, amount: data.amount };
      return apiRequest("PUT", `/api/incomes/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      incomeForm.reset();
      setEditingIncome(null);
      toast({ title: "Revenu modifié avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/incomes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      toast({ title: "Revenu supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const createDeductionMutation = useMutation({
    mutationFn: async (data: DeductionFormData) => {
      const payload = { 
        ...data, 
        amount: data.amount,
        deductionDate: Number(data.deductionDate)
      };
      return apiRequest("POST", "/api/deductions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deductions"] });
      deductionForm.reset();
      toast({ title: "Prélèvement ajouté avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'ajout du prélèvement", variant: "destructive" });
    },
  });

  const updateDeductionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DeductionFormData }) => {
      const payload = { 
        ...data, 
        amount: data.amount,
        deductionDate: Number(data.deductionDate)
      };
      return apiRequest("PUT", `/api/deductions/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deductions"] });
      deductionForm.reset();
      setEditingDeduction(null);
      toast({ title: "Prélèvement modifié avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/deductions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deductions"] });
      toast({ title: "Prélèvement supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  // Form handlers
  const onIncomeSubmit = (data: IncomeFormData) => {
    if (editingIncome) {
      updateIncomeMutation.mutate({ id: editingIncome.id, data });
    } else {
      createIncomeMutation.mutate(data);
    }
  };

  const onDeductionSubmit = (data: DeductionFormData) => {
    if (editingDeduction) {
      updateDeductionMutation.mutate({ id: editingDeduction.id, data });
    } else {
      createDeductionMutation.mutate(data);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    incomeForm.reset({
      description: income.description,
      amount: income.amount,
      frequency: income.frequency,
    });
  };

  const handleEditDeduction = (deduction: Deduction) => {
    setEditingDeduction(deduction);
    deductionForm.reset({
      description: deduction.description,
      amount: deduction.amount,
      category: deduction.category,
      deductionDate: deduction.deductionDate.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingIncome(null);
    setEditingDeduction(null);
    incomeForm.reset();
    deductionForm.reset();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long'
    }).format(new Date());
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      housing: "Logement",
      transport: "Transport", 
      insurance: "Assurance",
      utilities: "Services Publics",
      subscription: "Abonnements",
      other: "Autre"
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      monthly: "Mensuel",
      weekly: "Hebdomadaire",
      yearly: "Annuel"
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  if (incomesLoading || deductionsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Gestionnaire de Budget</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{getCurrentDate()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Revenus
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              Prélèvements
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prélèvements Totaux</CardTitle>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Minus className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Restant</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(remainingBudget)}
                  </div>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Répartition du Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Revenus</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Prélèvements</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalDeductions)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full" 
                    style={{ width: `${totalIncome > 0 ? (totalDeductions / totalIncome) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700">Restant</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(remainingBudget)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${totalIncome > 0 ? Math.max(0, (remainingBudget / totalIncome) * 100) : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Dernières Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomes.slice(0, 2).map((income) => {
                    const IconComponent = getIncomeIcon(income.description);
                    return (
                      <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <IconComponent className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{income.description}</p>
                            <p className="text-sm text-gray-500">{getFrequencyLabel(income.frequency)}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">{formatCurrency(Number(income.amount))}</span>
                      </div>
                    );
                  })}
                  {deductions.slice(0, 2).map((deduction) => {
                    const IconComponent = getCategoryIcon(deduction.category);
                    return (
                      <div key={deduction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-lg mr-3">
                            <IconComponent className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{deduction.description}</p>
                            <p className="text-sm text-gray-500">Prélèvement automatique</p>
                          </div>
                        </div>
                        <span className="font-semibold text-red-600">-{formatCurrency(Number(deduction.amount))}</span>
                      </div>
                    );
                  })}
                  {(incomes.length === 0 && deductions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune transaction pour le moment</p>
                      <p className="text-sm">Ajoutez des revenus et prélèvements pour voir un résumé ici</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Income Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{editingIncome ? "Modifier le Revenu" : "Ajouter un Revenu"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...incomeForm}>
                    <form onSubmit={incomeForm.handleSubmit(onIncomeSubmit)} className="space-y-4">
                      <FormField
                        control={incomeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Salaire, Freelance..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incomeForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={incomeForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fréquence</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la fréquence" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Mensuel</SelectItem>
                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                <SelectItem value="yearly">Annuel</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={createIncomeMutation.isPending || updateIncomeMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {editingIncome ? "Modifier" : "Ajouter"}
                        </Button>
                        {editingIncome && (
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            Annuler
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Income List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des Revenus</CardTitle>
                    <div className="text-sm text-gray-500">
                      Total: <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incomes.map((income) => {
                      const IconComponent = getIncomeIcon(income.description);
                      return (
                        <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg mr-4">
                              <IconComponent className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{income.description}</h4>
                              <p className="text-sm text-gray-500">{getFrequencyLabel(income.frequency)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-green-600">{formatCurrency(Number(income.amount))}</span>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditIncome(income)}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteIncomeMutation.mutate(income.id)}
                                className="text-gray-400 hover:text-red-600"
                                disabled={deleteIncomeMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {incomes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun revenu ajouté</p>
                        <p className="text-sm">Ajoutez vos sources de revenus pour calculer votre budget</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Deduction Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{editingDeduction ? "Modifier le Prélèvement" : "Ajouter un Prélèvement"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...deductionForm}>
                    <form onSubmit={deductionForm.handleSubmit(onDeductionSubmit)} className="space-y-4">
                      <FormField
                        control={deductionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Loyer, Assurance..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deductionForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deductionForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la catégorie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="housing">Logement</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="insurance">Assurance</SelectItem>
                                <SelectItem value="utilities">Services Publics</SelectItem>
                                <SelectItem value="subscription">Abonnements</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={deductionForm.control}
                        name="deductionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de Prélèvement</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="31" placeholder="Jour du mois (1-31)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={createDeductionMutation.isPending || updateDeductionMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {editingDeduction ? "Modifier" : "Ajouter"}
                        </Button>
                        {editingDeduction && (
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            Annuler
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Deduction List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Liste des Prélèvements</CardTitle>
                    <div className="text-sm text-gray-500">
                      Total: <span className="font-semibold text-red-600">{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deductions.map((deduction) => {
                      const IconComponent = getCategoryIcon(deduction.category);
                      return (
                        <div key={deduction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg mr-4">
                              <IconComponent className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{deduction.description}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{getCategoryLabel(deduction.category)}</span>
                                <span>•</span>
                                <span>Prélevé le {deduction.deductionDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-red-600">{formatCurrency(Number(deduction.amount))}</span>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDeduction(deduction)}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDeductionMutation.mutate(deduction.id)}
                                className="text-gray-400 hover:text-red-600"
                                disabled={deleteDeductionMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {deductions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Minus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun prélèvement ajouté</p>
                        <p className="text-sm">Ajoutez vos prélèvements récurrents pour un suivi automatique</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
