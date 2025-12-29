"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, ArrowRight, ArrowLeft, Upload, File } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { operationsService } from "@/services/operationsService"
import { useAuthStore } from "@/hooks/useAuthStore"

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.string().min(2, "Localização é obrigatória"),
  department: z.string().min(2, "Delegacia é obrigatória"),
  targets: z.array(z.object({
    name: z.string().min(1, "Nome do alvo é obrigatório")
  })).min(1, "Adicione pelo menos um alvo"),
})

type FormValues = z.infer<typeof formSchema>

export function CreateOperationWizard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]) // Simulated files

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      location: "",
      department: "",
      targets: [{ name: "" }]
    },
    mode: "onChange"
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targets"
  })

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
        isValid = await form.trigger(["title", "description", "priority", "location", "department"]);
    } else if (step === 2) {
        isValid = await form.trigger("targets");
    }
    
    if (isValid) setStep(prev => prev + 1);
  }

  const handleBack = () => setStep(prev => prev - 1);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
        // Transform form data to match service expectations
        const operationData = {
            title: data.title,
            description: data.description,
            priority: data.priority,
            location: data.location,
            department: data.department,
            createdBy: user.id,
            targets: data.targets.map(t => t.name)
        };

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        operationsService.create(operationData);
        
        toast.success("Operação criada com sucesso!", {
            description: "A operação está agora em status de Análise.",
        });
        
        router.push("/dashboard");
    } catch (error) {
        toast.error("Erro ao criar operação");
    } finally {
        setIsSubmitting(false);
    }
  }

  // Simulated File Upload
  const handleFileUpload = () => {
     setUploadedFiles(prev => [...prev, `documento_inicial_${prev.length + 1}.pdf`]);
     toast.success("Documento anexado (simulado)");
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10" />
                {[1, 2, 3].map((s) => (
                    <div 
                        key={s} 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 bg-white transition-colors
                            ${step >= s ? 'border-gov-blue text-gov-blue' : 'border-gray-300 text-gray-400'}
                            ${step === s ? 'ring-4 ring-blue-50' : ''}
                        `}
                    >
                        {s}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-gray-500">
                <span>Dados Básicos</span>
                <span>Alvos</span>
                <span>Anexos & Revisão</span>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>
                    {step === 1 && "Informações da Operação"}
                    {step === 2 && "Definição de Alvos"}
                    {step === 3 && "Anexos e Revisão"}
                </CardTitle>
                <CardDescription>
                    {step === 1 && "Preencha os dados iniciais para registrar a demanda."}
                    {step === 2 && "Identifique os alvos ou grupos investigados."}
                    {step === 3 && "Adicione documentos iniciais e confirme a criação."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Título da Operação</label>
                            <Input placeholder="Ex: Operação Trovão" {...form.register("title")} />
                            {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descrição Detalhada</label>
                            <Input placeholder="Descreva o objetivo..." {...form.register("description")} />
                            {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prioridade</label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...form.register("priority")}
                                >
                                    <option value="LOW">Baixa</option>
                                    <option value="MEDIUM">Média</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="CRITICAL">Crítica</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delegacia / Dept.</label>
                                <Input placeholder="Ex: DENARC" {...form.register("department")} />
                                {form.formState.errors.department && <p className="text-xs text-red-500">{form.formState.errors.department.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Localização Principal</label>
                            <Input placeholder="Ex: Recife - Boa Viagem" {...form.register("location")} />
                            {form.formState.errors.location && <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <Input 
                                        placeholder={`Nome do Alvo ${index + 1}`}
                                        {...form.register(`targets.${index}.name` as const)} 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => append({ name: "" })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Outro Alvo
                        </Button>
                        {form.formState.errors.targets && <p className="text-xs text-red-500">{form.formState.errors.targets.message}</p>}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileUpload}>
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                <Upload className="h-5 w-5 text-gov-blue" />
                            </div>
                            <h3 className="text-sm font-medium">Clique para fazer upload</h3>
                            <p className="text-xs text-gray-500 mt-1">Simulação de envio de arquivos (PDF, Imagens)</p>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Arquivos Anexados:</h4>
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                                        <File className="h-4 w-4 text-gov-blue" />
                                        <span>{file}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-md">
                            <h4 className="font-semibold text-gov-blue mb-2">Resumo:</h4>
                            <p className="text-sm text-gray-700"><strong>Operação:</strong> {form.getValues("title")}</p>
                            <p className="text-sm text-gray-700"><strong>Alvos:</strong> {form.getValues("targets").length}</p>
                            <p className="text-sm text-gray-700"><strong>Prioridade:</strong> {form.getValues("priority")}</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                
                {step < 3 ? (
                    <Button onClick={handleNext}>
                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Operação
                    </Button>
                )}
            </CardFooter>
        </Card>
    </div>
  )
}
