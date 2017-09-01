package org.hisp.dhis.dxf2.datavalue;

import static org.hisp.dhis.commons.util.TextUtils.valueOf;

import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class StreamingBinaryDataValue extends DataValue
{
    private ObjectOutputStream writer;
    

    private List<String> values;
    
    public StreamingBinaryDataValue( ObjectOutputStream  writer )
    {
        this.writer = writer;
        this.values = new ArrayList<>();
    }

    public StreamingBinaryDataValue( String[] row )
    {
        this.values = Arrays.asList( row );
    }

    //--------------------------------------------------------------------------
    // Supportive methods
    //--------------------------------------------------------------------------

    private String getValue( int index )
    {
        return index >= 0 && index < values.size() ? values.get( index ) : null;
    }

    //--------------------------------------------------------------------------
    // Getters
    //--------------------------------------------------------------------------

    @Override
    public String getDataElement()
    {
        return dataElement = dataElement == null ? getValue( 0 ) : dataElement;
    }

    @Override
    public String getPeriod()
    {
        return period = period == null ? getValue( 1 ) : period;
    }

    @Override
    public String getOrgUnit()
    {
        return orgUnit = orgUnit == null ? getValue( 2 ) : orgUnit;
    }

    @Override
    public String getCategoryOptionCombo()
    {
        return categoryOptionCombo = categoryOptionCombo == null ? getValue( 3 ) : categoryOptionCombo;
    }

    @Override
    public String getAttributeOptionCombo()
    {
        return attributeOptionCombo = attributeOptionCombo == null ? getValue( 4 ) : attributeOptionCombo;
    }
    
    @Override
    public String getValue()
    {
        return value = value == null ? getValue( 5 ) : value;
    }

    @Override
    public String getStoredBy()
    {
        return storedBy = storedBy == null ? getValue( 6 ) : storedBy;
    }

    @Override
    public String getLastUpdated()
    {
        return lastUpdated = lastUpdated == null ? getValue( 7 ) : lastUpdated;
    }

    @Override
    public String getComment()
    {
        return comment = comment == null ? getValue( 8 ) : comment;
    }

    @Override
    public Boolean getFollowup()
    {
        return followup = followup == null ? valueOf( getValue( 9 ) ) : followup;
    }
    
    @Override
    public Boolean getDeleted()
    {
        return deleted = deleted == null ? valueOf( getValue( 10 ) ) : deleted;
    }

    //--------------------------------------------------------------------------
    // Setters
    //--------------------------------------------------------------------------

    @Override
    public void setDataElement( String dataElement )
    {
        values.add( dataElement );
    }

    @Override
    public void setPeriod( String period )
    {
        values.add( period );
    }

    @Override
    public void setOrgUnit( String orgUnit )
    {
        values.add( orgUnit );
    }

    @Override
    public void setCategoryOptionCombo( String categoryOptionCombo )
    {
        values.add( categoryOptionCombo );
    }

    @Override
    public void setAttributeOptionCombo( String attributeOptionCombo )
    {
        values.add( attributeOptionCombo );
    }

    @Override
    public void setValue( String value )
    {
        values.add( value );
    }

    @Override
    public void setStoredBy( String storedBy )
    {
        values.add( storedBy );
    }

    @Override
    public void setLastUpdated( String lastUpdated )
    {
        values.add( lastUpdated );
    }

    @Override
    public void setComment( String comment )
    {
        values.add( comment );
    }

    @Override
    public void setFollowup( Boolean followup )
    {
        values.add( valueOf( followup ) );
    }
    
    @Override
    public void setDeleted( Boolean deleted )
    {
        values.add( valueOf( deleted ) );
    }

    @Override
    public void close()
    {
        try
        {
            SerializableDataValue temp = new SerializableDataValue();
            temp.dataElement = this.getDataElement() == null ? null : this.getDataElement().getBytes();
            temp.period = this.getPeriod() == null ? null : this.getPeriod().getBytes();
            temp.orgUnit = this.getOrgUnit() == null ? null : this.getOrgUnit().getBytes();
            temp.categoryOptionCombo = this.getCategoryOptionCombo() == null ? null : this.getCategoryOptionCombo().getBytes();
            temp.attributeOptionCombo = this.getAttributeOptionCombo() == null ? null : this.getAttributeOptionCombo().getBytes();
            temp.value = this.getValue() == null ? null : this.getValue().getBytes();
            temp.storedBy = this.getStoredBy() == null ? null : this.getStoredBy().getBytes();
            temp.lastUpdated = this.getLastUpdated() == null ? null : this.getLastUpdated().getBytes();
            temp.comment = this.getComment() == null ? null : this.getComment().getBytes();
            temp.followUp = this.getFollowup();
            //temp.deleted=this.getDeleted();
            writer.writeObject( temp );
        }
        catch ( IOException e )
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public static String[] getHeaders()
    {
        String[] headers = {
            "dataelement", "period", "orgunit",
            "categoryoptioncombo", "attributeoptioncombo", "value", 
            "storedby", "lastupdated", "comment", "followup", "deleted" };

        return headers;
    }
}
