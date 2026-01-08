import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const FORMATS = {
  document: ['PDF', 'DOCX', 'TXT', 'RTF', 'ODT'],
  image: ['PNG', 'JPG', 'WEBP', 'SVG', 'GIF', 'BMP'],
  other: ['ZIP', 'CSV', 'JSON', 'XML']
};

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      toast({
        title: 'Файл загружен',
        description: `${droppedFile.name} готов к конвертации`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast({
        title: 'Файл загружен',
        description: `${selectedFile.name} готов к конвертации`,
      });
    }
  };

  const handleConvert = () => {
    if (!file || !targetFormat) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл и формат конвертации',
        variant: 'destructive',
      });
      return;
    }

    setConverting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setConverting(false);
          toast({
            title: 'Готово!',
            description: `Файл успешно конвертирован в ${targetFormat}`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="RefreshCw" className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-bold">FileConvert</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <section id="converter" className="mb-24 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Конвертация файлов онлайн</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Быстро преобразуйте файлы между популярными форматами без установки программ
            </p>
          </div>

          <Card className="p-8 max-w-3xl mx-auto animate-scale-in">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    <Icon name="File" size={20} />
                    {file.name}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">Перетащите файл сюда</p>
                  <p className="text-sm text-muted-foreground mb-4">или</p>
                </>
              )}
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button asChild variant="outline" className="mt-4">
                <label htmlFor="file-input" className="cursor-pointer">
                  <Icon name="FolderOpen" size={18} className="mr-2" />
                  Выбрать файл
                </label>
              </Button>
            </div>

            {file && (
              <div className="mt-8 space-y-6 animate-fade-in">
                <div>
                  <label className="text-sm font-medium mb-3 block">Выберите формат конвертации</label>
                  <Tabs defaultValue="document" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="document">Документы</TabsTrigger>
                      <TabsTrigger value="image">Изображения</TabsTrigger>
                      <TabsTrigger value="other">Другое</TabsTrigger>
                    </TabsList>
                    {Object.entries(FORMATS).map(([category, formats]) => (
                      <TabsContent key={category} value={category} className="mt-4">
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {formats.map(format => (
                            <Button
                              key={format}
                              variant={targetFormat === format ? 'default' : 'outline'}
                              onClick={() => setTargetFormat(format)}
                              className="w-full"
                            >
                              {format}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                {converting && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-sm">
                      <span>Конвертация...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleConvert}
                  disabled={!targetFormat || converting}
                  className="w-full"
                  size="lg"
                >
                  {converting ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Конвертация...
                    </>
                  ) : (
                    <>
                      <Icon name="RefreshCw" size={20} className="mr-2" />
                      Конвертировать в {targetFormat || '...'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </section>

        <section id="features" className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Возможности и безопасность</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="Zap" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая конвертация</h3>
              <p className="text-muted-foreground">
                Преобразование файлов занимает считанные секунды благодаря оптимизированным алгоритмам
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Безопасность данных</h3>
              <p className="text-muted-foreground">
                Файлы автоматически удаляются после конвертации. Возможна обработка в браузере
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="Smartphone" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Работает везде</h3>
              <p className="text-muted-foreground">
                Адаптивный интерфейс работает на компьютерах, планшетах и мобильных устройствах
              </p>
            </Card>
          </div>
        </section>

        <section id="howto" className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Как использовать</h2>
          <Card className="p-8 max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step1">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <span>Загрузите файл</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-11 text-muted-foreground">
                  Перетащите файл в зону загрузки или нажмите кнопку "Выбрать файл". Поддерживаются все популярные форматы документов и изображений.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step2">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <span>Выберите формат</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-11 text-muted-foreground">
                  Выберите нужный формат из списка. Форматы разделены по категориям: документы, изображения и другие типы файлов.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step3">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <span>Конвертируйте и скачайте</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-11 text-muted-foreground">
                  Нажмите кнопку "Конвертировать" и дождитесь завершения. После этого файл автоматически скачается на ваше устройство.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>

        <section id="contact" className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">Контакты</h2>
          <Card className="p-8 max-w-2xl mx-auto text-center">
            <div className="space-y-6">
              <div>
                <Icon name="Mail" size={32} className="mx-auto mb-3 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">support@fileconvert.com</p>
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Есть вопросы или предложения? Свяжитесь с нами, и мы обязательно ответим.
                </p>
                <Button variant="outline">
                  <Icon name="MessageSquare" size={18} className="mr-2" />
                  Написать нам
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 FileConvert. Все права защищены.</p>
          <p className="mt-2">API для интеграции доступен по запросу</p>
        </div>
      </footer>
    </div>
  );
}