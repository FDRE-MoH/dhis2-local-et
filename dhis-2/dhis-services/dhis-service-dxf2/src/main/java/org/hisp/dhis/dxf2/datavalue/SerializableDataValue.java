package org.hisp.dhis.dxf2.datavalue;

import java.io.Serializable;

public class SerializableDataValue implements Serializable
{
        /**
     * temporary serial version id
     */
    static final long serialVersionUID = 2387121L;
    private int[] dataElement;
    private int[] period;
    private int[] orgUnit;
    private int[] categoryOptionCombo;
    private int[] attributeOptionCombo;
    private int[] value;
    private int[] storedBy;
    private int[] lastUpdated;
    private int[] comment;
    private boolean followUp;
    private boolean deleted;
    
    public void setDataElement(String dataElementName) {
        if(dataElementName==null) {
            this.dataElement=null;
            return;
        }
        byte[] dataElementNameBytes=dataElementName.getBytes();
        this.dataElement=new int[dataElementNameBytes.length];
        for(int i=0;i<dataElementNameBytes.length;i++) {
            this.dataElement[i]=(int)dataElementNameBytes[i];
        }
    }
    
    public String getDataElement() {
        if(this.dataElement==null) {
            return null;
        }
        byte[] dataElementNameBytes=new byte[this.dataElement.length];
        for(int i=0;i<dataElementNameBytes.length;i++) {
            dataElementNameBytes[i]=(byte)this.dataElement[i];
        }
        
        return new String (dataElementNameBytes);
    }
    
    
    public void setPeriod(String periodName) {
        if(periodName==null) {
            this.period=null;
            return;
        }
        byte[] periodNameBytes=periodName.getBytes();
        this.period=new int[periodNameBytes.length];
        for(int i=0;i<periodNameBytes.length;i++) {
            this.period[i]=(int)periodNameBytes[i];
        }
    }
    
    public String getPeriod() {
        if(this.period==null) {
            return null;
        }
        byte[] periodNameBytes=new byte[this.period.length];
        for(int i=0;i<periodNameBytes.length;i++) {
            periodNameBytes[i]=(byte)this.period[i];
        }
        
        return new String (periodNameBytes);
    }
    
    public void setOrgUnit(String orgUnitName) {
        if(orgUnitName==null) {
            this.orgUnit=null;
            return;
        }
        byte[] orgUnitNameBytes=orgUnitName.getBytes();
        this.orgUnit=new int[orgUnitNameBytes.length];
        for(int i=0;i<orgUnitNameBytes.length;i++) {
            this.orgUnit[i]=(int)orgUnitNameBytes[i];
        }
    }
    
    public String getOrgUnit() {
        if(this.orgUnit==null) {
            return null;
        }
        byte[] orgUnitNameBytes=new byte[this.orgUnit.length];
        for(int i=0;i<orgUnitNameBytes.length;i++) {
            orgUnitNameBytes[i]=(byte)this.orgUnit[i];
        }
        
        return new String (orgUnitNameBytes);
    }
    
    public void setCategoryOptionCombo(String categoryOptionComboName) {
        if(categoryOptionComboName==null) {
            this.categoryOptionCombo=null;
            return;
        }
        byte[] categoryOptionComboNameBytes=categoryOptionComboName.getBytes();
        this.categoryOptionCombo=new int[categoryOptionComboNameBytes.length];
        for(int i=0;i<categoryOptionComboNameBytes.length;i++) {
            this.categoryOptionCombo[i]=(int)categoryOptionComboNameBytes[i];
        }
    }
    
    public String getCategoryOptionCombo() {
        if(this.categoryOptionCombo==null) {
            return null;
        }
        byte[] categoryOptionComboNameBytes=new byte[this.categoryOptionCombo.length];
        for(int i=0;i<categoryOptionComboNameBytes.length;i++) {
            categoryOptionComboNameBytes[i]=(byte)this.categoryOptionCombo[i];
        }
        
        return new String (categoryOptionComboNameBytes);
    }
    
    public void setAttributeOptionCombo(String attributeOptionComboName) {
        if(attributeOptionComboName==null) {
            this.attributeOptionCombo=null;
            return;
        }
        byte[] attributeOptionComboNameBytes=attributeOptionComboName.getBytes();
        this.attributeOptionCombo=new int[attributeOptionComboNameBytes.length];
        for(int i=0;i<attributeOptionComboNameBytes.length;i++) {
            this.attributeOptionCombo[i]=(int)attributeOptionComboNameBytes[i];
        }
    }
    
    public String getAttributeOptionCombo() {
        if(this.attributeOptionCombo==null) {
            return null;
        }
        byte[] attributeOptionComboNameBytes=new byte[this.attributeOptionCombo.length];
        for(int i=0;i<attributeOptionComboNameBytes.length;i++) {
            attributeOptionComboNameBytes[i]=(byte)this.attributeOptionCombo[i];
        }
        
        return new String (attributeOptionComboNameBytes);
    }
    
    public void setValue(String valueName) {
        if(valueName==null) {
            this.value=null;
            return;
        }
        byte[] valueBytes=valueName.getBytes();
        this.value=new int[valueBytes.length];
        for(int i=0;i<valueBytes.length;i++) {
            this.value[i]=(int)valueBytes[i];
        }
    }
    
    public String getValue() {
        if(this.value==null) {
            return null;
        }
        byte[] valueBytes=new byte[this.value.length];
        for(int i=0;i<valueBytes.length;i++) {
            valueBytes[i]=(byte)this.value[i];
        }
        
        return new String (valueBytes);
    }
    
    public void setComment(String commentName) {
        if(commentName==null) {
            this.comment=null;
            return;
        }
        byte[] commentBytes=commentName.getBytes();
        this.comment=new int[commentBytes.length];
        for(int i=0;i<commentBytes.length;i++) {
            this.comment[i]=(int)commentBytes[i];
        }
    }
    
    public String getComment() {
        if(this.comment==null) {
            return null;
        }
        byte[] commentBytes=new byte[this.comment.length];
        for(int i=0;i<commentBytes.length;i++) {
            commentBytes[i]=(byte)this.comment[i];
        }
        
        return new String (commentBytes);
    }
    
    public void setLastUpdated(String lastUpdatedName) {
        if(lastUpdatedName==null) {
            this.lastUpdated=null;
            return;
        }
        byte[] lastUpdatedBytes=lastUpdatedName.getBytes();
        this.lastUpdated=new int[lastUpdatedBytes.length];
        for(int i=0;i<lastUpdatedBytes.length;i++) {
            this.lastUpdated[i]=(int)lastUpdatedBytes[i];
        }
    }
    
    public String getLastUpdated() {
        if(this.lastUpdated==null) {
            return null;
        }
        byte[] lastUpdatedBytes=new byte[this.lastUpdated.length];
        for(int i=0;i<lastUpdatedBytes.length;i++) {
            lastUpdatedBytes[i]=(byte)this.lastUpdated[i];
        }
        
        return new String (lastUpdatedBytes);
    }
    
    public void setStoredBy(String storedByName) {
        if(storedByName==null) {
            this.storedBy=null;
            return;
        }
        byte[] storedByBytes=storedByName.getBytes();
        this.storedBy=new int[storedByBytes.length];
        for(int i=0;i<storedByBytes.length;i++) {
            this.storedBy[i]=(int)storedByBytes[i];
        }
    }
    
    public String getStoredBy() {
        if(this.storedBy==null) {
            return null;
        }
        byte[] storedByBytes=new byte[this.storedBy.length];
        for(int i=0;i<storedByBytes.length;i++) {
            storedByBytes[i]=(byte)this.storedBy[i];
        }
        
        return new String (storedByBytes);
    }
    
    public boolean getFollowUp() {
        return this.followUp;
    }
    
    public void setFollowUp( boolean follow_up) {
        this.followUp=follow_up;
    }
    
    public boolean getDeleted() {
        return deleted;
    }
    
    public void setDeleted( boolean deletedValue) {
        this.deleted=deletedValue;
    }
    
}
