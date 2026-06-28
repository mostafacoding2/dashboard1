import { suppliersList } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, FileText, Star, StarHalf } from "lucide-react";

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">الموردون</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suppliersList.map((supplier) => (
          <Card key={supplier.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{supplier.name}</CardTitle>
                <div className="flex items-center bg-background px-2 py-1 rounded-full border shadow-sm">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-1" />
                  <span className="text-sm font-medium">{supplier.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">رقم الهاتف</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{supplier.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">{supplier.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">العنوان</p>
                  <p className="text-sm text-muted-foreground">{supplier.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">السجل التجاري</p>
                  <p className="text-sm text-muted-foreground font-mono">{supplier.commercialRegister}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}