# -*- coding: utf-8 -*-
"""SprintIII(separação de dados).ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1f_ggyLdquBC3Nx2bHe5HPZ83w00p2a59
"""

import pandas as pd
import numpy as np
from pandas import DataFrame, Series
#!pip install pandasql
import pandasql
from sklearn.model_selection import train_test_split

df = pd.read_csv('resultado-busca-phoenix.csv')

print(df)

Data = df[['_id']]
Data

Avistamentos = df[['count']]
Avistamentos

Data_treinamento, Data_teste, Avistamentos_treinamento, Avistamentos_teste  = train_test_split(Data, Avistamentos, shuffle=False, train_size=0.7)

Data_treinamento

Data_teste

Avistamentos_treinamento

Avistamentos_teste