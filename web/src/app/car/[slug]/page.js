import React from 'react';
import OnePayment from "@/components/OnePayment";

function Page({params}) {
    return (
        <div>
            <h1>Car {params['slug']}</h1>
            <OnePayment CorralonKey="9NXsDXu1kKsLj7yLgLzwpuGV2sQHHfyLDxXTUEF51gvE"/>
        </div>
    );
}

export default Page;